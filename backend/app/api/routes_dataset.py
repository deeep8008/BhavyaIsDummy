from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.schemas.dataset_schemas import (
    DatasetUploadResponse,
    ColumnMappingRequest,
    ColumnMappingResponse,
    DatasetSummaryResponse,
    M5PreloadRequest,
)
from app.services.dataset_service import DatasetService
from app.core.config import settings

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/upload", response_model=DatasetUploadResponse)
async def upload_dataset(
    files: List[UploadFile] = File(...),
    dataset_name: Optional[str] = Form(None)
):
    """
    Accepts one or multiple CSV files (or an entire uploaded folder).
    Validates that at least one .csv file is present; otherwise raises 400 Bad Request.
    """
    return await DatasetService.handle_file_uploads(files, dataset_name)

@router.post("/map-schema", response_model=ColumnMappingResponse)
def map_schema(mapping: ColumnMappingRequest):
    """
    Applies user column mapping, converts raw data to Canonical Schema,
    cleans missing timestamps/values, and stores as Parquet.
    """
    return DatasetService.map_and_process_dataset(mapping)

@router.get("/{dataset_id}/explore", response_model=DatasetSummaryResponse)
def explore_dataset(dataset_id: str):
    """Returns exploratory statistics, frequency, date ranges, and preview for the dataset."""
    return DatasetService.get_summary(dataset_id)

@router.post("/preload-m5", response_model=ColumnMappingResponse)
def preload_m5(request: M5PreloadRequest):
    """Preloads the reference M5 benchmark dataset directly from the server datasets folder."""
    return DatasetService.preload_m5_dataset(request)

@router.get("/list")
def list_available_datasets():
    """Lists all canonical parquet datasets currently saved in local storage."""
    processed_files = list(settings.PROCESSED_DIR.glob("*_canonical.parquet"))
    results = []
    for f in processed_files:
        ds_id = f.name.replace("_canonical.parquet", "")
        results.append({
            "dataset_id": ds_id,
            "filename": f.name,
            "size_bytes": f.stat().st_size
        })
    return {"datasets": results}
