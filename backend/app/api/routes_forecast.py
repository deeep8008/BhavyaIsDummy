from fastapi import APIRouter
from app.schemas.forecast_schemas import ForecastRunRequest, ForecastResultsResponse
from app.services.forecast_service import ForecastService

router = APIRouter(prefix="/forecast", tags=["Future Forecast & Insights"])

@router.post("/run", response_model=ForecastResultsResponse)
def run_future_forecast(request: ForecastRunRequest):
    """
    Retrains the selected model on 100% of available historical data,
    projects into the future horizon, computes uncertainty bounds,
    and returns business decision insights.
    """
    return ForecastService.generate_future_forecast(request)

@router.get("/{forecast_id}/results", response_model=ForecastResultsResponse)
def get_forecast_results(forecast_id: str):
    """Retrieves cached future forecast and business insights results."""
    return ForecastService.get_cached_forecast(forecast_id)
