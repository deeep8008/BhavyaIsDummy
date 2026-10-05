from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ForecastRunRequest(BaseModel):
    dataset_id: str
    model: str = Field(default="prophet", description="Candidate model: 'arima', 'prophet', 'lightgbm', 'deepar', 'tft'")
    horizon: int = Field(default=28, ge=1, le=365, description="Future forecast horizon in days (e.g. 7, 14, 28, 90)")
    series_id: Optional[str] = Field(default=None, description="Optional specific series_id to forecast. Defaults to all/total.")
    current_inventory: Optional[float] = Field(default=None, ge=0, description="Optional current on-hand inventory units for stockout risk calculation.")

class ForecastDataPoint(BaseModel):
    timestamp: str
    prediction: float
    lower_80: float
    upper_80: float
    lower_95: float
    upper_95: float

class BusinessInsights(BaseModel):
    total_projected_volume: float
    average_daily_demand: float
    peak_demand_date: str
    peak_demand_value: float
    min_demand_date: str
    min_demand_value: float
    demand_trend: str = Field(description="'increasing', 'decreasing', or 'relatively stable'")
    recommended_safety_stock: float
    safety_stock_method: str
    stockout_risk_status: str = Field(description="'unavailable', 'low_risk', 'moderate_risk', or 'high_risk'")
    stockout_risk_message: str
    estimated_stockout_date: Optional[str] = None

class ForecastResultsResponse(BaseModel):
    forecast_id: str
    dataset_id: str
    series_id: str
    selected_model: str
    model_type: str
    retrained_on_full_history: bool = True
    historical_observations_count: int
    historical_start: str
    historical_end: str
    forecast_start: str
    forecast_end: str
    horizon: int
    forecast: List[ForecastDataPoint]
    insights: BusinessInsights
    created_at: str
    message: str
