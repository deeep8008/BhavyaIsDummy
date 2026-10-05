from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
import lightgbm as lgb

from app.models.base_forecaster import BaseForecaster, ForecastOutput
from app.core.exceptions import PreprocessingError

class LightGBMForecaster(BaseForecaster):
    """Gradient Boosting Tree forecaster with lag features, rolling statistics, and calendar signals."""

    @property
    def name(self) -> str:
        return "LightGBM"

    @property
    def model_type(self) -> str:
        return "tree"

    def _extract_step_features(self, history: np.ndarray, f_date: pd.Timestamp) -> Dict[str, Any]:
        """Extracts lag, rolling stats, and calendar features for a single future date step."""
        feat = {
            "dayofweek": f_date.dayofweek,
            "dayofmonth": f_date.day,
            "month": f_date.month,
            "is_weekend": int(f_date.dayofweek >= 5)
        }
        for lag in [1, 2, 3, 7, 14]:
            feat[f"lag_{lag}"] = float(history[-lag]) if len(history) >= lag else float(history[0])

        for window in [7, 14]:
            w_vals = history[-window:] if len(history) >= window else history
            feat[f"rolling_mean_{window}"] = float(np.mean(w_vals))
            feat[f"rolling_std_{window}"] = float(np.std(w_vals)) if len(w_vals) > 1 else 0.0

        return feat

    def fit(self, df_canonical_train: pd.DataFrame) -> "LightGBMForecaster":
        if df_canonical_train.empty:
            raise PreprocessingError("LightGBM cannot train on an empty dataset.")

        df = df_canonical_train.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

        self.last_timestamp = df["timestamp"].max()
        self.series_ids = list(df["series_id"].unique())

        grouped = df.groupby("timestamp")["target"].sum().reset_index()
        self.history_values = grouped["target"].values
        self.history_dates = pd.DatetimeIndex(grouped["timestamp"])

        # Build feature table from history
        feature_rows = []
        for i in range(14, len(self.history_values)):
            h = self.history_values[:i]
            d = self.history_dates[i]
            row_feat = self._extract_step_features(h, d)
            row_feat["target"] = float(self.history_values[i])
            feature_rows.append(row_feat)

        if not feature_rows:
            # Fallback for ultra-short series
            for i in range(1, len(self.history_values)):
                h = self.history_values[:i]
                d = self.history_dates[i]
                row_feat = self._extract_step_features(h, d)
                row_feat["target"] = float(self.history_values[i])
                feature_rows.append(row_feat)

        df_train_feat = pd.DataFrame(feature_rows)
        feature_cols = [c for c in df_train_feat.columns if c != "target"]
        self.feature_names = feature_cols

        X_train = df_train_feat[feature_cols]
        y_train = df_train_feat["target"]

        n_estimators = self.model_params.get("n_estimators", 100)
        learning_rate = self.model_params.get("learning_rate", 0.05)
        
        # Adaptive min_child_samples for small sample sizes
        min_child_samples = max(2, min(20, len(X_train) // 4))

        self.model_ = lgb.LGBMRegressor(
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            min_child_samples=min_child_samples,
            random_state=42,
            verbosity=-1,
            force_row_wise=True
        )
        self.model_.fit(X_train, y_train)

        # In-sample residual standard deviation for confidence intervals
        train_preds = self.model_.predict(X_train)
        self.residual_std = float(np.std(y_train - train_preds)) or 1.0

        self.is_fitted = True
        return self

    def predict(
        self,
        horizon_steps: int,
        df_future_covariates: Optional[pd.DataFrame] = None
    ) -> ForecastOutput:
        if not self.is_fitted:
            raise PreprocessingError("LightGBM model must be fitted before predict() is called.")

        future_dates = self._generate_future_timestamps(self.last_timestamp, horizon_steps)
        future_dt_index = pd.DatetimeIndex(future_dates)

        current_history = list(self.history_values)
        predictions = []

        for i in range(horizon_steps):
            f_date = future_dt_index[i]
            h_arr = np.array(current_history)

            step_feat = self._extract_step_features(h_arr, f_date)
            row_df = pd.DataFrame([step_feat])[self.feature_names]

            step_pred = float(self.model_.predict(row_df)[0])
            step_pred = max(0.0, step_pred)
            predictions.append(step_pred)

            current_history.append(step_pred)

        lower_80, upper_80 = [], []
        lower_95, upper_95 = [], []

        for step_idx, pred in enumerate(predictions):
            uncertainty_scale = np.sqrt(1 + step_idx * 0.05) * self.residual_std
            l80 = max(0.0, pred - 1.28 * uncertainty_scale)
            u80 = pred + 1.28 * uncertainty_scale
            l95 = max(0.0, pred - 1.96 * uncertainty_scale)
            u95 = pred + 1.96 * uncertainty_scale

            lower_80.append(round(l80, 3))
            upper_80.append(round(u80, 3))
            lower_95.append(round(l95, 3))
            upper_95.append(round(u95, 3))

        timestamps = [str(d.date()) for d in future_dates]

        return ForecastOutput(
            timestamps=timestamps,
            predictions=[round(float(p), 3) for p in predictions],
            model_name=self.name,
            lower_bound_80=lower_80,
            upper_bound_80=upper_80,
            lower_bound_95=lower_95,
            upper_bound_95=upper_95,
            metadata={"n_features": len(self.feature_names)}
        )

