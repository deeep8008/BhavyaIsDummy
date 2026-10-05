from fastapi import APIRouter
from app.schemas.split_schemas import SplitRequest, SplitResponse
from app.services.dataset_service import DatasetService
from app.pipeline.splitter import ChronologicalSplitter

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])

@router.post("/split", response_model=SplitResponse)
def split_dataset(request: SplitRequest):
    """
    Performs strict chronological train/test splitting on the canonical dataset.
    Guarantees 0% lookahead bias / data leakage.
    """
    df_canonical = DatasetService.get_canonical_dataframe(request.dataset_id)
    _, _, metadata = ChronologicalSplitter.split(
        df_canonical=df_canonical,
        train_percentage=request.train_percentage,
        fixed_test_days=request.fixed_test_days,
        series_id=request.series_id
    )

    return SplitResponse(
        dataset_id=request.dataset_id,
        total_observations=metadata["total_observations"],
        train_observations=metadata["train_observations"],
        test_observations=metadata["test_observations"],
        train_percentage=metadata["train_percentage"],
        test_percentage=metadata["test_percentage"],
        train_window=metadata["train_window"],
        test_window=metadata["test_window"],
        status="split_configured",
        message=f"Dataset chronologically split into {metadata['train_steps']} training days and {metadata['test_steps']} hidden test days."
    )
