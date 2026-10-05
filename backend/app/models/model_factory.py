from typing import Dict, Type, List, Any, Optional
from app.models.base_forecaster import BaseForecaster
from app.models.arima_forecaster import ARIMAForecaster
from app.models.prophet_forecaster import ProphetForecaster
from app.models.lightgbm_forecaster import LightGBMForecaster
from app.models.deepar_forecaster import DeepARForecaster
from app.models.tft_forecaster import TFTForecaster

class ModelFactory:
    """Registry and factory for all candidate time-series forecasting models."""

    _REGISTRY: Dict[str, Type[BaseForecaster]] = {
        "arima": ARIMAForecaster,
        "prophet": ProphetForecaster,
        "lightgbm": LightGBMForecaster,
        "deepar": DeepARForecaster,
        "tft": TFTForecaster,
    }

    @classmethod
    def get_model(cls, model_name: str, model_params: Optional[Dict[str, Any]] = None) -> BaseForecaster:
        """Instantiates a forecaster model by its registered key."""
        key = model_name.lower().strip()
        if key not in cls._REGISTRY:
            raise ValueError(
                f"Unknown model '{model_name}'. Available models: {list(cls._REGISTRY.keys())}"
            )
        model_cls = cls._REGISTRY[key]
        return model_cls(model_params=model_params)

    @classmethod
    def list_available_models(cls) -> List[Dict[str, Any]]:
        """Returns metadata for all registered models."""
        return [
            {
                "key": "arima",
                "name": "ARIMA / SARIMA",
                "type": "statistical",
                "description": "Autoregressive Integrated Moving Average statistical baseline."
            },
            {
                "key": "prophet",
                "name": "Prophet",
                "type": "additive",
                "description": "Decomposable additive model for trends, weekly/yearly seasonality, and holidays."
            },
            {
                "key": "lightgbm",
                "name": "LightGBM",
                "type": "tree",
                "description": "Fast gradient boosted trees with lag, rolling window, and calendar features."
            },
            {
                "key": "deepar",
                "name": "DeepAR",
                "type": "deep_learning",
                "description": "Probabilistic Autoregressive RNN (LSTM) for non-linear uncertainty bounds."
            },
            {
                "key": "tft",
                "name": "Temporal Fusion Transformer (TFT)",
                "type": "deep_learning",
                "description": "State-of-the-art transformer with multi-horizon self-attention and quantile loss."
            }
        ]
