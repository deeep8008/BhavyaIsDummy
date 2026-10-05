from pathlib import Path
from typing import Tuple
from app.data_adapters.base_adapter import BaseDatasetAdapter
from app.data_adapters.generic_csv_adapter import GenericCSVAdapter
from app.data_adapters.m5_adapter import M5DatasetAdapter
from app.pipeline.validator import DatasetValidator

class AdapterFactory:
    """Detects dataset format and returns the appropriate adapter instance."""

    @staticmethod
    def get_adapter(raw_path: Path) -> Tuple[BaseDatasetAdapter, str]:
        """
        Inspects directory and returns (adapter_instance, detected_type_string).
        """
        csv_files = DatasetValidator.scan_directory_for_csvs(raw_path)
        filenames = {f.name.lower() for f in csv_files}

        # Check for M5 signature
        has_sales = any("sales_train" in name for name in filenames)
        has_calendar = "calendar.csv" in filenames

        if has_sales and has_calendar:
            return M5DatasetAdapter(), "m5_dataset"
        elif len(csv_files) > 1:
            return GenericCSVAdapter(), "multi_csv_folder"
        else:
            return GenericCSVAdapter(), "single_csv"
