from typing import Optional, Dict, Any
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX

from app.models.base_forecaster import BaseForecaster, ForecastOutput
from app.core.exceptions import PreprocessingError

class ARIMAForecaster(BaseForecaster):
    """ARIMA / SARIMA statistical time-series forecaster."""

    @property
    def name(self) -> str:
        return "ARIMA"

    @property
    def model_type(self) -> str:
        return "statistical"

    def fit(self, df_canonical_train: pd.DataFrame) -> "ARIMAForecaster":
        if df_canonical_train.empty:
            raise PreprocessingError("ARIMA cannot train on an empty dataset.")

        df = df_canonical_train.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

        self.last_timestamp = df["timestamp"].max()
        self.series_ids = list(df["series_id"].unique())

        # If multiple series, fit on the primary or aggregated target
        y_train = df.groupby("timestamp")["target"].sum().values

        order = self.model_params.get("order", (1, 1, 1))
        seasonal_order = self.model_params.get("seasonal_order", (0, 0, 0, 0))

        try:
            self.model_ = SARIMAX(
                y_train,
                order=order,
                seasonal_order=seasonal_order,
                enforce_stationarity=False,
                enforce_invertibility=False
            )
            self.fitted_model_ = self.model_.fit(disp=False)
            self.is_fitted = True
        except Exception as e:
            # Fallback to simple autoregressive (1, 0, 0) if order fails
            self.model_ = SARIMAX(y_train, order=(1, 0, 0))
            self.fitted_model_ = self.model_.fit(disp=False)
            self.is_fitted = True

        return self

    def predict(
        self,
        horizon_steps: int,
        df_future_covariates: Optional[pd.DataFrame] = None
    ) -> ForecastOutput:
        if not self.is_fitted:
            raise PreprocessingError("ARIMA model must be fitted before predict() is called.")

        forecast_res = self.fitted_model_.get_forecast(steps=horizon_steps)
        predictions = np.maximum(0, forecast_res.predicted_mean).tolist()

        # Extract confidence intervals
        ci_80 = forecast_res.conf_int(alpha=0.20)
        ci_95 = forecast_res.conf_int(alpha=0.05)

        lower_80 = np.maximum(0, ci_80[:, 0]).tolist()
        upper_80 = np.maximum(0, ci_80[:, 1]).tolist()
        lower_95 = np.maximum(0, ci_95[:, 0]).tolist()
        upper_95 = np.maximum(0, ci_95[:, 1]).tolist()

        future_dates = self._generate_future_timestamps(self.last_timestamp, horizon_steps)
        timestamps = [str(d.date()) for d in future_dates]

        return ForecastOutput(
            timestamps=timestamps,
            predictions=[round(float(p), 3) for p in predictions],
            model_name=self.name,
            lower_bound_80=[round(float(v), 3) for v in lower_80],
            upper_bound_80=[round(float(v), 3) for v in upper_80],
            lower_bound_95=[round(float(v), 3) for v in lower_95],
            upper_bound_95=[round(float(v), 3) for v in upper_95],
            metadata={"order": self.model_params.get("order", (1, 1, 1))}
        )
