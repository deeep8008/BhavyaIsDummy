import logging
from typing import Optional, Dict, Any
import pandas as pd
import numpy as np
from prophet import Prophet

from app.models.base_forecaster import BaseForecaster, ForecastOutput
from app.core.exceptions import PreprocessingError

# Suppress cmdstanpy / prophet logs
logging.getLogger("cmdstanpy").setLevel(logging.WARNING)
logging.getLogger("prophet").setLevel(logging.WARNING)

class ProphetForecaster(BaseForecaster):
    """Facebook Prophet additive trend & seasonality forecaster."""

    @property
    def name(self) -> str:
        return "Prophet"

    @property
    def model_type(self) -> str:
        return "additive"

    def fit(self, df_canonical_train: pd.DataFrame) -> "ProphetForecaster":
        if df_canonical_train.empty:
            raise PreprocessingError("Prophet cannot train on an empty dataset.")

        df = df_canonical_train.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

        self.last_timestamp = df["timestamp"].max()
        self.series_ids = list(df["series_id"].unique())

        # Aggregate by timestamp if multiple series
        grouped = df.groupby("timestamp")["target"].sum().reset_index()
        prophet_df = pd.DataFrame({
            "ds": grouped["timestamp"],
            "y": grouped["target"]
        })

        yearly_seasonality = self.model_params.get("yearly_seasonality", "auto")
        weekly_seasonality = self.model_params.get("weekly_seasonality", "auto")
        daily_seasonality = self.model_params.get("daily_seasonality", False)

        self.model_ = Prophet(
            yearly_seasonality=yearly_seasonality,
            weekly_seasonality=weekly_seasonality,
            daily_seasonality=daily_seasonality,
            interval_width=0.95
        )

        self.model_.fit(prophet_df)
        self.is_fitted = True
        return self

    def predict(
        self,
        horizon_steps: int,
        df_future_covariates: Optional[pd.DataFrame] = None
    ) -> ForecastOutput:
        if not self.is_fitted:
            raise PreprocessingError("Prophet model must be fitted before predict() is called.")

        future_df = self.model_.make_future_dataframe(periods=horizon_steps, freq="D", include_history=False)
        forecast = self.model_.predict(future_df)

        predictions = np.maximum(0, forecast["yhat"].values).tolist()
        lower_95 = np.maximum(0, forecast["yhat_lower"].values).tolist()
        upper_95 = np.maximum(0, forecast["yhat_upper"].values).tolist()

        # Approximate 80% CI from 95% (or 0.80 factor)
        spread_95 = np.array(upper_95) - np.array(lower_95)
        lower_80 = np.maximum(0, np.array(predictions) - 0.65 * (spread_95 / 2)).tolist()
        upper_80 = (np.array(predictions) + 0.65 * (spread_95 / 2)).tolist()

        timestamps = [str(d.date()) for d in pd.to_datetime(forecast["ds"])]

        return ForecastOutput(
            timestamps=timestamps,
            predictions=[round(float(p), 3) for p in predictions],
            model_name=self.name,
            lower_bound_80=[round(float(v), 3) for v in lower_80],
            upper_bound_80=[round(float(v), 3) for v in upper_80],
            lower_bound_95=[round(float(v), 3) for v in lower_95],
            upper_bound_95=[round(float(v), 3) for v in upper_95],
            metadata={"growth": "linear"}
        )
