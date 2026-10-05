import uuid
import shutil
from pathlib import Path
from typing import List, Optional
import pandas as pd
from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import DatasetNotFoundError, NoCsvFoundError, InvalidSchemaError
from app.data_adapters.adapter_factory import AdapterFactory
from app.pipeline.validator import DatasetValidator
from app.pipeline.cleaner import TimeSeriesCleaner
from app.schemas.dataset_schemas import (
    DatasetUploadResponse,
    ColumnMappingRequest,
    ColumnMappingResponse,
    DatasetSummaryResponse,
    M5PreloadRequest,
)

class DatasetService:
    """Orchestrates dataset upload, validation, mapping, Parquet persistence, and summary stats."""

    @staticmethod
    async def handle_file_uploads(files: List[UploadFile], dataset_name: Optional[str] = None) -> DatasetUploadResponse:
        dataset_id = f"ds_{uuid.uuid4().hex[:8]}"
        target_dir = settings.UPLOADS_DIR / dataset_id
        target_dir.mkdir(parents=True, exist_ok=True)

        name = dataset_name or (files[0].filename if files else "Uploaded_Dataset")

        # Save all uploaded files
        for file in files:
            # Preserve original filenames
            file_path = target_dir / Path(file.filename).name
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

        # Validate that at least one .csv exists
        csv_files = DatasetValidator.scan_directory_for_csvs(target_dir)

        # Detect adapter and extract preview
        adapter, detected_type = AdapterFactory.get_adapter(target_dir)
        columns, preview_rows, total_lines = adapter.extract_preview(target_dir, n_rows=5)

        return DatasetUploadResponse(
            dataset_id=dataset_id,
            dataset_name=name,
            detected_type=detected_type,
            csv_files=[f.name for f in csv_files],
            available_columns=columns,
            preview_rows=preview_rows,
            total_raw_rows=total_lines,
            message=f"Successfully uploaded {len(csv_files)} CSV file(s). Please confirm column mapping."
        )

    @staticmethod
    def map_and_process_dataset(mapping: ColumnMappingRequest) -> ColumnMappingResponse:
        raw_dir = settings.UPLOADS_DIR / mapping.dataset_id
        if not raw_dir.exists():
            raise DatasetNotFoundError(mapping.dataset_id)

        adapter, _ = AdapterFactory.get_adapter(raw_dir)
        canonical_df = adapter.transform_to_canonical(raw_dir, mapping)

        # Clean and regularize
        cleaned_df, inferred_freq, missing_found, missing_imputed = (
            TimeSeriesCleaner.infer_and_regularize_frequency(canonical_df)
        )

        # Save canonical Parquet
        parquet_path = settings.PROCESSED_DIR / f"{mapping.dataset_id}_canonical.parquet"
        cleaned_df.to_parquet(parquet_path, index=False)

        start_date = str(cleaned_df["timestamp"].min().date())
        end_date = str(cleaned_df["timestamp"].max().date())
        series_count = int(cleaned_df["series_id"].nunique())

        return ColumnMappingResponse(
            dataset_id=mapping.dataset_id,
            canonical_rows_count=len(cleaned_df),
            series_count=series_count,
            start_date=start_date,
            end_date=end_date,
            detected_frequency=inferred_freq,
            status="standardized",
            message="Dataset standardized into Canonical Schema and cached as Parquet."
        )

    @staticmethod
    def preload_m5_dataset(request: M5PreloadRequest) -> ColumnMappingResponse:
        m5_dir = settings.DATASETS_DIR
        if not m5_dir.exists():
            raise DatasetNotFoundError("Reference 'datasets/' directory not found on server.")

        adapter, detected_type = AdapterFactory.get_adapter(m5_dir)
        dataset_id = "m5_reference"

        # Transform M5 directly
        canonical_df = adapter.transform_to_canonical(
            m5_dir,
            aggregation_level=request.aggregation_level,
            max_days=request.max_days,
            max_series=request.max_series
        )

        cleaned_df, inferred_freq, _, _ = TimeSeriesCleaner.infer_and_regularize_frequency(canonical_df)

        parquet_path = settings.PROCESSED_DIR / f"{dataset_id}_canonical.parquet"
        cleaned_df.to_parquet(parquet_path, index=False)

        start_date = str(cleaned_df["timestamp"].min().date())
        end_date = str(cleaned_df["timestamp"].max().date())

        return ColumnMappingResponse(
            dataset_id=dataset_id,
            canonical_rows_count=len(cleaned_df),
            series_count=int(cleaned_df["series_id"].nunique()),
            start_date=start_date,
            end_date=end_date,
            detected_frequency=inferred_freq,
            status="standardized",
            message=f"M5 benchmark preloaded ({request.aggregation_level} aggregation) into Canonical Schema."
        )

    @staticmethod
    def get_canonical_dataframe(dataset_id: str) -> pd.DataFrame:
        parquet_path = settings.PROCESSED_DIR / f"{dataset_id}_canonical.parquet"
        if not parquet_path.exists():
            # Check for m5 aliases
            if dataset_id in ("m5_benchmark_total", "m5_total", "m5"):
                fallback = settings.PROCESSED_DIR / "m5_reference_canonical.parquet"
                if fallback.exists():
                    return pd.read_parquet(fallback)
            raise DatasetNotFoundError(dataset_id)
        return pd.read_parquet(parquet_path)

    @staticmethod
    def get_summary(dataset_id: str) -> DatasetSummaryResponse:
        df = DatasetService.get_canonical_dataframe(dataset_id)
        df["timestamp"] = pd.to_datetime(df["timestamp"])

        unique_series = list(df["series_id"].unique())
        start_date = str(df["timestamp"].min().date())
        end_date = str(df["timestamp"].max().date())

        target_vals = df["target"].dropna()
        target_stats = {
            "min": float(target_vals.min()) if not target_vals.empty else 0.0,
            "max": float(target_vals.max()) if not target_vals.empty else 0.0,
            "mean": round(float(target_vals.mean()), 2) if not target_vals.empty else 0.0,
            "std": round(float(target_vals.std()), 2) if len(target_vals) > 1 else 0.0,
        }

        # Return the most recent 100 records for chart visualization
        sample_records = df.tail(100).fillna("").to_dict(orient="records")
        for r in sample_records:
            r["timestamp"] = str(pd.to_datetime(r["timestamp"]).date())

        return DatasetSummaryResponse(
            dataset_id=dataset_id,
            dataset_name=dataset_id,
            total_observations=len(df),
            series_count=len(unique_series),
            series_ids=unique_series[:20],
            start_date=start_date,
            end_date=end_date,
            frequency="Daily",
            missing_values_found=0,
            missing_values_imputed=0,
            target_stats=target_stats,
            sample_records=sample_records
        )
