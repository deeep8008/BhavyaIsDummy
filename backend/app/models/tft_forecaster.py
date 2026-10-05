import warnings
from typing import Optional, Dict, Any
import pandas as pd
import numpy as np
import torch
from darts import TimeSeries
from darts.models import TFTModel
from darts.utils.likelihood_models import QuantileRegression
from darts.dataprocessing.transformers import Scaler

from app.models.base_forecaster import BaseForecaster, ForecastOutput
from app.core.exceptions import PreprocessingError

warnings.filterwarnings("ignore")

class TFTForecaster(BaseForecaster):
    """Temporal Fusion Transformer (TFT) multi-horizon deep learning forecaster."""

    @property
    def name(self) -> str:
        return "TFT"

    @property
    def model_type(self) -> str:
        return "deep_learning"

    def fit(self, df_canonical_train: pd.DataFrame) -> "TFTForecaster":
        if df_canonical_train.empty:
            raise PreprocessingError("TFT cannot train on an empty dataset.")

        df = df_canonical_train.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

        self.last_timestamp = df["timestamp"].max()
        self.series_ids = list(df["series_id"].unique())

        grouped = df.groupby("timestamp")["target"].sum().reset_index()
        raw_series = TimeSeries.from_dataframe(
            grouped,
            time_col="timestamp",
            value_cols="target",
            fill_missing_dates=True,
            freq="D"
        )

        # Scale series for neural network stability
        self.scaler_ = Scaler()
        self.series_ = self.scaler_.fit_transform(raw_series)

        input_chunk = min(len(self.series_) // 2, self.model_params.get("input_chunk_length", 14))
        input_chunk = max(3, input_chunk)
        output_chunk = self.model_params.get("output_chunk_length", 7)
        n_epochs = self.model_params.get("n_epochs", 20)

        # Quantile regression for probabilistic bounds
        quantiles = [0.025, 0.10, 0.50, 0.90, 0.975]

        self.model_ = TFTModel(
            input_chunk_length=input_chunk,
            output_chunk_length=output_chunk,
            hidden_size=16,
            lstm_layers=1,
            num_attention_heads=2,
            dropout=0.1,
            add_relative_index=True,
            likelihood=QuantileRegression(quantiles=quantiles),
            n_epochs=n_epochs,
            random_state=42,
            pl_trainer_kwargs={"enable_progress_bar": False, "enable_model_summary": False, "accelerator": "cpu"}
        )

        self.model_.fit(self.series_, verbose=False)
        self.is_fitted = True
        return self

    def predict(
        self,
        horizon_steps: int,
        df_future_covariates: Optional[pd.DataFrame] = None
    ) -> ForecastOutput:
        if not self.is_fitted:
            raise PreprocessingError("TFT model must be fitted before predict() is called.")

        forecast_ts_scaled = self.model_.predict(n=horizon_steps, num_samples=100)
        forecast_ts = self.scaler_.inverse_transform(forecast_ts_scaled)

        predictions = np.maximum(0, forecast_ts.quantile(0.50).values().flatten()).tolist()

        lower_80 = np.maximum(0, forecast_ts.quantile(0.10).values().flatten()).tolist()
        upper_80 = np.maximum(0, forecast_ts.quantile(0.90).values().flatten()).tolist()
        lower_95 = np.maximum(0, forecast_ts.quantile(0.025).values().flatten()).tolist()
        upper_95 = np.maximum(0, forecast_ts.quantile(0.975).values().flatten()).tolist()

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
            metadata={"architecture": "Temporal Fusion Transformer", "attention_heads": 2}
        )
