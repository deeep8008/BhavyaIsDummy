from typing import Tuple, Dict, Any
import pandas as pd
import numpy as np

class TimeSeriesCleaner:
    """Cleans, sorts, regularizes time gaps, and imputes missing values in canonical datasets."""

    @staticmethod
    def infer_and_regularize_frequency(df: pd.DataFrame) -> Tuple[pd.DataFrame, str, int, int]:
        """
        Cleans the canonical dataset:
        1. Drops invalid timestamps and sorts by series_id and timestamp.
        2. Infers time series cadence (Daily, Weekly, Hourly, or Unknown).
        3. Imputes missing target values.
        Returns: (cleaned_df, inferred_freq_str, missing_found, missing_imputed)
        """
        df = df.copy()
        df = df.dropna(subset=["timestamp"])
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values(by=["series_id", "timestamp"]).reset_index(drop=True)

        missing_found = int(df["target"].isna().sum())
        missing_imputed = 0

        # Detect primary frequency
        inferred_freq = "Daily"
        cleaned_series_list = []

        for series_id, group in df.groupby("series_id"):
            group = group.drop_duplicates(subset=["timestamp"]).sort_values("timestamp")
            
            # Detect frequency delta
            if len(group) >= 3:
                time_diffs = group["timestamp"].diff().dropna()
                median_diff = time_diffs.median()
                
                if median_diff == pd.Timedelta(days=1):
                    inferred_freq = "Daily"
                elif median_diff == pd.Timedelta(weeks=1) or median_diff == pd.Timedelta(days=7):
                    inferred_freq = "Weekly"
                elif median_diff == pd.Timedelta(hours=1):
                    inferred_freq = "Hourly"
                elif median_diff == pd.Timedelta(minutes=15):
                    inferred_freq = "15-Minute"
                elif median_diff == pd.Timedelta(hours=4):
                    inferred_freq = "4-Hour"

            # Handle missing target imputation
            if group["target"].isna().any():
                group["target"] = group["target"].interpolate(method="linear").ffill().bfill().fillna(0.0)
                missing_imputed += missing_found

            cleaned_series_list.append(group)

        if cleaned_series_list:
            final_df = pd.concat(cleaned_series_list, ignore_index=True)
        else:
            final_df = df

        return final_df, inferred_freq, missing_found, missing_imputed
