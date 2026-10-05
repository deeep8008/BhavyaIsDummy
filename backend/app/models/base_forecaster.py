from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
import pandas as pd
import numpy as np

@dataclass
class ForecastOutput:
    """Standardized output container for all forecasting models."""
    timestamps: List[str]
    predictions: List[float]
    model_name: str
    lower_bound_80: Optional[List[float]] = None
    upper_bound_80: Optional[List[float]] = None
    lower_bound_95: Optional[List[float]] = None
    upper_bound_95: Optional[List[float]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

class BaseForecaster(ABC):
    """Abstract Base Forecaster interface for all candidate models in ForecastIQ."""

    def __init__(self, model_params: Optional[Dict[str, Any]] = None):
        self.model_params = model_params or {}
        self.is_fitted = False
        self.last_timestamp = None
        self.inferred_freq = "D"
        self.series_ids = []

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name of the forecasting model."""
        pass

    @property
    @abstractmethod
    def model_type(self) -> str:
        """Category: 'statistical', 'additive', 'tree', or 'deep_learning'."""
        pass

    @abstractmethod
    def fit(self, df_canonical_train: pd.DataFrame) -> "BaseForecaster":
        """
        Trains the model strictly on the canonical training DataFrame:
        Columns required: [series_id, timestamp, target] + optional covariates.
        """
        pass

    @abstractmethod
    def predict(
        self,
        horizon_steps: int,
        df_future_covariates: Optional[pd.DataFrame] = None
    ) -> ForecastOutput:
        """
        Generates predictions for the requested future horizon steps.
        Returns standardized ForecastOutput.
        """
        pass

    def _generate_future_timestamps(self, last_time: pd.Timestamp, horizon: int) -> List[pd.Timestamp]:
        """Generates future timestamp sequence based on inferred frequency."""
        # Normalize frequency for date_range
        freq_alias = self.inferred_freq
        if freq_alias == "Daily" or freq_alias == "D":
            freq = "D"
        elif freq_alias == "Weekly" or freq_alias == "W":
            freq = "W"
        elif freq_alias == "Hourly" or freq_alias == "h":
            freq = "h"
        else:
            freq = "D"

        future_dates = pd.date_range(
            start=last_time + pd.Timedelta(days=1 if freq == "D" else 1),
            periods=horizon,
            freq=freq
        )
        return list(future_dates)
