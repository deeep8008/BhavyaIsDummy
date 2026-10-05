from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class SplitRequest(BaseModel):
    dataset_id: str
    train_percentage: float = Field(default=0.80, ge=0.50, le=0.95, description="Percentage allocated to training (between 50% and 95%)")
    fixed_test_days: Optional[int] = Field(default=None, ge=1, description="Optional fixed test window in days instead of percentage")
    series_id: Optional[str] = Field(default=None, description="Optional specific series_id to compute split for")

class WindowMetadata(BaseModel):
    start_date: str
    end_date: str
    count: int

class SplitResponse(BaseModel):
    dataset_id: str
    total_observations: int
    train_observations: int
    test_observations: int
    train_percentage: float
    test_percentage: float
    train_window: WindowMetadata
    test_window: WindowMetadata
    status: str
    message: str
