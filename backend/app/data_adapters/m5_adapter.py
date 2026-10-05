from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
from app.data_adapters.base_adapter import BaseDatasetAdapter
from app.schemas.dataset_schemas import ColumnMappingRequest
from app.core.exceptions import InvalidSchemaError

class M5DatasetAdapter(BaseDatasetAdapter):
    """Specialized adapter for the Walmart M5 Multi-Table Wide-Format Benchmark Dataset."""

    def validate_source(self, raw_path: Path) -> List[Path]:
        csvs = list(raw_path.glob("*.csv")) + list(raw_path.glob("*/*.csv"))
        filenames = {f.name.lower() for f in csvs}
        
        has_sales = any("sales_train" in name for name in filenames)
        has_calendar = "calendar.csv" in filenames
        
        if not (has_sales and has_calendar):
            raise InvalidSchemaError(
                "M5 dataset requires at least 'sales_train_validation.csv' (or evaluation) and 'calendar.csv'."
            )
        return csvs

    def extract_preview(self, raw_path: Path, n_rows: int = 5, selected_file: str = None) -> Tuple[List[str], List[Dict[str, Any]], int]:
        csvs = self.validate_source(raw_path)
        sales_file = next(f for f in csvs if "sales_train" in f.name.lower())
        
        df_preview = pd.read_csv(sales_file, nrows=n_rows)
        columns = list(df_preview.columns[:15]) + ["... (up to d_1913/d_1941)"]
        preview_rows = df_preview.iloc[:, :10].fillna("").to_dict(orient="records")
        return columns, preview_rows, 30490

    def transform_to_canonical(
        self,
        raw_path: Path,
        mapping: Optional[ColumnMappingRequest] = None,
        aggregation_level: str = "total",
        max_days: Optional[int] = None,
        max_series: int = 10
    ) -> pd.DataFrame:
        """
        Transforms M5 wide format into canonical DataFrame.
        aggregation_level: 'total', 'store', 'state', or 'dept'
        """
        csvs = self.validate_source(raw_path)
        sales_file = next((f for f in csvs if "evaluation" in f.name.lower()), None)
        if not sales_file:
            sales_file = next(f for f in csvs if "sales_train" in f.name.lower())
            
        calendar_file = next(f for f in csvs if "calendar.csv" in f.name.lower())

        # Load calendar
        df_cal = pd.read_csv(calendar_file)[["date", "d", "event_name_1", "snap_CA", "snap_TX", "snap_WI"]]
        df_cal["timestamp"] = pd.to_datetime(df_cal["date"])
        d_to_date = dict(zip(df_cal["d"], df_cal["timestamp"]))

        # Read sales
        df_sales = pd.read_csv(sales_file)
        id_cols = ["id", "item_id", "dept_id", "cat_id", "store_id", "state_id"]
        d_cols = [c for c in df_sales.columns if c.startswith("d_")]

        if max_days and max_days < len(d_cols):
            d_cols = d_cols[-max_days:] # Take recent days for fast processing

        canonical_rows = []

        if aggregation_level == "total":
            # Sum all series into one enterprise-level series
            daily_sum = df_sales[d_cols].sum(axis=0)
            canonical_df = pd.DataFrame({
                "series_id": "Enterprise_Total",
                "d": daily_sum.index,
                "target": daily_sum.values.astype(float)
            })
            canonical_df["timestamp"] = canonical_df["d"].map(d_to_date)
            canonical_df = canonical_df.drop(columns=["d"]).dropna(subset=["timestamp"])

        elif aggregation_level in ["store", "state", "dept"]:
            group_col = f"{aggregation_level}_id"
            grouped = df_sales.groupby(group_col)[d_cols].sum()
            
            # Limit number of series if needed
            grouped = grouped.iloc[:max_series]
            
            melted = grouped.reset_index().melt(
                id_vars=[group_col],
                value_vars=d_cols,
                var_name="d",
                value_name="target"
            )
            melted["series_id"] = melted[group_col].astype(str)
            melted["timestamp"] = melted["d"].map(d_to_date)
            melted["target"] = melted["target"].astype(float)
            canonical_df = melted[["series_id", "timestamp", "target"]].dropna(subset=["timestamp"])

        else:
            # Item level sample
            sample_df = df_sales.iloc[:max_series]
            melted = sample_df.melt(
                id_vars=["id"],
                value_vars=d_cols,
                var_name="d",
                value_name="target"
            )
            melted["series_id"] = melted["id"].astype(str)
            melted["timestamp"] = melted["d"].map(d_to_date)
            melted["target"] = melted["target"].astype(float)
            canonical_df = melted[["series_id", "timestamp", "target"]].dropna(subset=["timestamp"])

        return canonical_df.sort_values(by=["series_id", "timestamp"]).reset_index(drop=True)
