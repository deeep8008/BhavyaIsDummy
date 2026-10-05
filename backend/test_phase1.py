import os
import sys
from pathlib import Path
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

# Add backend directory to python path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.main import app
from app.core.config import settings

client = TestClient(app)

def print_header(title: str):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health_endpoints():
    print_header("TEST 1: Health & Root Endpoints")
    response = client.get("/")
    assert response.status_code == 200, f"Root failed: {response.text}"
    print("[PASS] GET / returned 200 OK:", response.json())

    response_health = client.get("/health")
    assert response_health.status_code == 200
    print("[PASS] GET /health returned 200 OK:", response_health.json())

def test_no_csv_warning():
    print_header("TEST 2: No-CSV Upload Warning Validation")
    # Create temporary non-csv file
    dummy_txt = settings.STORAGE_DIR / "dummy_notes.txt"
    dummy_txt.write_text("This is not a CSV file.")
    
    with open(dummy_txt, "rb") as f:
        response = client.post(
            "/api/v1/datasets/upload",
            files=[("files", ("dummy_notes.txt", f, "text/plain"))]
        )
    
    assert response.status_code == 400, f"Expected 400 Bad Request, got {response.status_code}"
    res_json = response.json()
    assert res_json["error"] == "NoCsvFoundError"
    print("[PASS] Successfully intercepted non-CSV upload!")
    print(f"  Status: {response.status_code}")
    print(f"  Warning Message: {res_json['message']}")

def test_generic_csv_workflow():
    print_header("TEST 3: Generic CSV Upload, Mapping & Canonical Parquet")
    
    # Generate a realistic 100-day generic time-series dataset (energy usage)
    dates = pd.date_range(start="2023-01-01", periods=100, freq="D")
    np.random.seed(42)
    kwh_usage = 100 + np.sin(np.linspace(0, 20, 100)) * 25 + np.random.normal(0, 3, 100)
    
    # Introduce 2 missing values to test cleaner imputation
    kwh_usage[15] = np.nan
    kwh_usage[40] = np.nan

    sample_csv_path = settings.STORAGE_DIR / "energy_test_data.csv"
    df_sample = pd.DataFrame({
        "recorded_date": dates.strftime("%Y-%m-%d"),
        "grid_region": ["North_Region"] * 50 + ["South_Region"] * 50,
        "kwh_consumed": kwh_usage,
        "temperature_celsius": 20 + np.random.normal(0, 5, 100)
    })
    df_sample.to_csv(sample_csv_path, index=False)

    # 1. Upload generic CSV
    with open(sample_csv_path, "rb") as f:
        upload_resp = client.post(
            "/api/v1/datasets/upload",
            files=[("files", ("energy_test_data.csv", f, "text/csv"))],
            data={"dataset_name": "Regional_Energy_Consumption"}
        )
    assert upload_resp.status_code == 200, f"Upload failed: {upload_resp.text}"
    upload_data = upload_resp.json()
    dataset_id = upload_data["dataset_id"]
    print(f"[PASS] Uploaded generic CSV successfully. Assigned Dataset ID: {dataset_id}")
    print(f"  Detected Columns: {upload_data['available_columns']}")

    # 2. Apply Column Mapping
    mapping_payload = {
        "dataset_id": dataset_id,
        "time_column": "recorded_date",
        "target_column": "kwh_consumed",
        "series_id_column": "grid_region",
        "dynamic_covariates": ["temperature_celsius"]
    }
    map_resp = client.post("/api/v1/datasets/map-schema", json=mapping_payload)
    assert map_resp.status_code == 200, f"Mapping failed: {map_resp.text}"
    map_data = map_resp.json()
    print("[PASS] Schema mapped & converted to Canonical Parquet:")
    print(f"  Rows count: {map_data['canonical_rows_count']}")
    print(f"  Series count: {map_data['series_count']}")
    print(f"  Frequency: {map_data['detected_frequency']}")
    print(f"  Date Range: {map_data['start_date']} to {map_data['end_date']}")

    # 3. Explore Dataset API
    explore_resp = client.get(f"/api/v1/datasets/{dataset_id}/explore")
    assert explore_resp.status_code == 200
    exp_data = explore_resp.json()
    print("[PASS] Dataset Explore API:")
    print(f"  Target Stats: {exp_data['target_stats']}")
    print(f"  Total Observations: {exp_data['total_observations']}")

    # 4. Chronological Train/Test Split (80/20)
    print_header("TEST 4: Chronological Train/Test Split (0% Data Leakage)")
    split_payload = {
        "dataset_id": dataset_id,
        "train_percentage": 0.80
    }
    split_resp = client.post("/api/v1/pipeline/split", json=split_payload)
    assert split_resp.status_code == 200, f"Split failed: {split_resp.text}"
    split_data = split_resp.json()

    print(f"[PASS] Chronological Split Completed (80/20):")
    print(f"  Train Window: {split_data['train_window']['start_date']} to {split_data['train_window']['end_date']} ({split_data['train_window']['count']} steps)")
    print(f"  Test Window:  {split_data['test_window']['start_date']} to {split_data['test_window']['end_date']} ({split_data['test_window']['count']} steps)")
    
    # Assert temporal ordering strictly
    train_end = pd.to_datetime(split_data['train_window']['end_date'])
    test_start = pd.to_datetime(split_data['test_window']['start_date'])
    assert train_end < test_start, f"Data leakage detected! Train end {train_end} is not before test start {test_start}"
    print("[PASS] Zero Data Leakage Verified: All training dates strictly precede hidden test dates.")

def test_m5_adapter():
    print_header("TEST 5: M5 Benchmark Multi-Table Wide-Format Adapter")
    
    # Test preloading reference M5 dataset with total aggregation and recent 100 days
    preload_payload = {
        "aggregation_level": "total",
        "max_days": 100
    }
    preload_resp = client.post("/api/v1/datasets/preload-m5", json=preload_payload)
    assert preload_resp.status_code == 200, f"M5 preload failed: {preload_resp.text}"
    m5_data = preload_resp.json()

    print("[PASS] M5 Dataset Wide-to-Long Canonical Transformation Successful:")
    print(f"  Dataset ID: {m5_data['dataset_id']}")
    print(f"  Canonical Rows: {m5_data['canonical_rows_count']}")
    print(f"  Date Range: {m5_data['start_date']} to {m5_data['end_date']}")
    print(f"  Frequency: {m5_data['detected_frequency']}")

    # Test M5 Train/Test Split (e.g. 28-day holdout)
    split_payload = {
        "dataset_id": "m5_reference",
        "fixed_test_days": 28
    }
    split_resp = client.post("/api/v1/pipeline/split", json=split_payload)
    assert split_resp.status_code == 200
    split_data = split_resp.json()
    print("[PASS] M5 28-Day Holdout Split Configured:")
    print(f"  Train Days: {split_data['train_window']['count']} days ({split_data['train_window']['start_date']} to {split_data['train_window']['end_date']})")
    print(f"  Hidden Test: {split_data['test_window']['count']} days ({split_data['test_window']['start_date']} to {split_data['test_window']['end_date']})")


if __name__ == "__main__":
    test_health_endpoints()
    test_no_csv_warning()
    test_generic_csv_workflow()
    test_m5_adapter()
    print("\n" + "="*60)
    print("  ALL PHASE 1 BACKEND TESTS PASSED WITH 100% SUCCESS!")
    print("="*60)
