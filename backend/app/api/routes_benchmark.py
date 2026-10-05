from fastapi import APIRouter
from app.schemas.benchmark_schemas import BenchmarkRunRequest, BenchmarkResultsResponse
from app.services.benchmark_service import BenchmarkService

router = APIRouter(prefix="/benchmark", tags=["Benchmark & Evaluation"])

@router.post("/run", response_model=BenchmarkResultsResponse)
def run_benchmark(request: BenchmarkRunRequest):
    """
    Runs chronological historical backtesting on all candidate models.
    Hides the test period during model.fit(), evaluates predictions on actuals,
    and returns a dynamic leaderboard ranked by MAPE (with RMSE tie-breaker).
    """
    return BenchmarkService.run_benchmark(request)

@router.get("/{dataset_id}/results", response_model=BenchmarkResultsResponse)
def get_benchmark_results(dataset_id: str):
    """Retrieves cached benchmark and evaluation leaderboard results for a dataset."""
    return BenchmarkService.get_cached_results(dataset_id)
