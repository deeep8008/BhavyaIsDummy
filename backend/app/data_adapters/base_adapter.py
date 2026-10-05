from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Dict, Any, Tuple
import pandas as pd
from app.schemas.dataset_schemas import ColumnMappingRequest

class BaseDatasetAdapter(ABC):
    """Abstract interface for dataset adapters that ingest raw files and convert to Canonical Schema."""

    @abstractmethod
    def validate_source(self, raw_path: Path) -> List[Path]:
        """Validates source files and returns list of discovered CSV paths."""
        pass

    @abstractmethod
    def extract_preview(self, raw_path: Path, n_rows: int = 5, selected_file: str = None) -> Tuple[List[str], List[Dict[str, Any]], int]:
        """Returns (available_columns, preview_rows, total_raw_rows) for mapping."""
        pass

    @abstractmethod
    def transform_to_canonical(self, raw_path: Path, mapping: ColumnMappingRequest) -> pd.DataFrame:
        """Transforms raw dataset into canonical DataFrame with [series_id, timestamp, target, ...]."""
        pass
