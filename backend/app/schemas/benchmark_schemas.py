from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class BenchmarkRunRequest(BaseModel):
    dataset_id: str
    train_percentage: float = Field(default=0.80, ge=0.50, le=0.95)
    fixed_test_days: Optional[int] = Field(default=None, ge=1)
    candidate_models: List[str] = Field(default=["arima", "prophet", "lightgbm", "deepar", "tft"])
    series_id: Optional[str] = Field(default=None)

class ModelLeaderboardItem(BaseModel):
    rank: int
    model_name: str
    model_key: str
    model_type: str
    mape: float
    rmse: float
    mae: float
    wape: float
    train_time_seconds: float
    status: str

class BenchmarkResultsResponse(BaseModel):
    dataset_id: str
    split_info: Dict[str, Any]
    leaderboard: List[ModelLeaderboardItem]
    test_timestamps: List[str]
    test_actuals: List[float]
    model_predictions: Dict[str, List[float]]
    aligned_comparison_table: List[Dict[str, Any]]
    ranking_rule: str = "Primary: MAPE (ascending), Secondary: RMSE (ascending)"
    message: str
