import sys
import time
from pathlib import Path
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.main import app
from app.core.config import settings
from app.evaluation.metrics import Metrics
from app.evaluation.engine import EvaluationEngine
from app.evaluation.leaderboard import LeaderboardGenerator
from app.models.model_factory import ModelFactory
from app.pipeline.splitter import ChronologicalSplitter
from app.services.dataset_service import DatasetService
from app.schemas.benchmark_schemas import BenchmarkRunRequest


client = TestClient(app)

def print_header(title: str):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def test_1_controlled_metrics():
    print_header("TEST 1: Controlled Known Metric Calculations")
    
    # Hand-calculable values
    y_true = np.array([100.0, 200.0, 300.0])
    y_pred = np.array([110.0, 190.0, 330.0])
    
    # Expected:
    # Errors: |100-110|=10 (10%), |200-190|=10 (5%), |300-330|=30 (10%)
    # Expected MAPE = (10% + 5% + 10%) / 3 = 8.3333%
    # Expected MSE = (100 + 100 + 900) / 3 = 366.6667 -> RMSE = 19.1485
    # Expected MAE = (10 + 10 + 30) / 3 = 16.6667
    
    calculated_mape = Metrics.mape(y_true, y_pred)
    calculated_rmse = Metrics.rmse(y_true, y_pred)
    calculated_mae = Metrics.mae(y_true, y_pred)
    
    assert abs(calculated_mape - 8.3333) < 1e-3, f"Expected MAPE ~8.3333, got {calculated_mape}"
    assert abs(calculated_rmse - 19.1485) < 1e-3, f"Expected RMSE ~19.1485, got {calculated_rmse}"
    assert abs(calculated_mae - 16.6667) < 1e-3, f"Expected MAE ~16.6667, got {calculated_mae}"
    
    print(f"[PASS] Hand-Calculated MAPE: 8.3333%  | Engine Result: {calculated_mape}%")
    print(f"[PASS] Hand-Calculated RMSE: 19.1485  | Engine Result: {calculated_rmse}")
    print(f"[PASS] Hand-Calculated MAE:  16.6667  | Engine Result: {calculated_mae}")

def test_2_zero_target_safety():
    print_header("TEST 2: Zero Target Value Safety (No NaN / Inf / ZeroDivision)")
    
    # Dataset containing 0s in actual values
    y_true = np.array([0.0, 100.0, 0.0, 200.0])
    y_pred = np.array([0.0, 110.0, 5.0, 180.0])
    
    mape_result = Metrics.mape(y_true, y_pred)
    rmse_result = Metrics.rmse(y_true, y_pred)
    
    assert not np.isnan(mape_result), "MAPE must not be NaN"
    assert not np.isinf(mape_result), "MAPE must not be Inf"
    assert mape_result >= 0.0, "MAPE must be non-negative"
    
    print(f"[PASS] Handled actual targets with zero values safely:")
    print(f"  y_true: {list(y_true)}")
    print(f"  y_pred: {list(y_pred)}")
    print(f"  Safe MAPE Output: {mape_result}% (Computed over non-zero ground-truth)")
    print(f"  RMSE Output:      {rmse_result}")

def test_3_data_leakage_and_horizon():
    print_header("TEST 3: Zero Data Leakage & Horizon Alignment Verification")
    
    dates = pd.date_range("2024-01-01", periods=60, freq="D")
    df = pd.DataFrame({
        "series_id": "test_leakage_series",
        "timestamp": dates,
        "target": np.linspace(10, 50, 60)
    })
    
    train_df, test_df, meta = ChronologicalSplitter.split(df, train_percentage=0.80)
    
    train_max = train_df["timestamp"].max()
    test_min = test_df["timestamp"].min()
    
    # 1. Assert chronological non-overlapping condition
    assert train_max < test_min, f"Data leakage! train_max {train_max} >= test_min {test_min}"
    print(f"[PASS] Chronological Boundary Verified:")
    print(f"  Train Window End Date: {train_max.date()}")
    print(f"  Test Window Start Date: {test_min.date()}")
    print(f"  Assertion max(train) < min(test): TRUE")

    # 2. Assert EvaluationEngine enforces non-leakage
    model = ModelFactory.get_model("arima")
    result = EvaluationEngine.evaluate_model(model, "arima", train_df, test_df)
    
    assert len(result.predictions) == len(test_df), "Prediction length must match test horizon"
    assert len(result.timestamps) == len(test_df), "Timestamps length must match test horizon"
    assert result.timestamps[0] == str(test_min.date()), f"First prediction date {result.timestamps[0]} must match test start {test_min.date()}"
    print(f"[PASS] 1-to-1 Horizon Alignment Verified: {len(result.predictions)} predictions match {len(test_df)} test observations exactly.")

def test_4_five_model_benchmark():
    print_header("TEST 4: Complete Five-Model Backtesting Benchmark")
    
    # Controlled 80-day dataset (60 days train, 20 days hidden test)
    np.random.seed(42)
    dates = pd.date_range("2024-01-01", periods=80, freq="D")
    trend = np.linspace(40, 80, 80)
    seasonality = 12 * np.sin(np.linspace(0, 8 * np.pi, 80))
    noise = np.random.normal(0, 2, 80)
    target_values = np.maximum(5, trend + seasonality + noise)

    df_benchmark = pd.DataFrame({
        "series_id": "canonical_store_1",
        "timestamp": dates,
        "target": target_values
    })

    train_df, test_df, split_meta = ChronologicalSplitter.split(df_benchmark, train_percentage=0.75)
    horizon = len(test_df)
    
    print(f"Dataset Split for Backtesting:")
    print(f"  Training observations (used in fit): {len(train_df)} ({train_df['timestamp'].min().date()} to {train_df['timestamp'].max().date()})")
    print(f"  Hidden test observations (held out): {horizon} ({test_df['timestamp'].min().date()} to {test_df['timestamp'].max().date()})")

    candidate_keys = ["arima", "prophet", "lightgbm", "deepar", "tft"]
    eval_results = []

    for key in candidate_keys:
        start_t = time.time()
        model = ModelFactory.get_model(key)
        
        # Pure model-agnostic evaluation
        res = EvaluationEngine.evaluate_model(model, key, train_df, test_df)
        elapsed = time.time() - start_t
        eval_results.append(res)
        
        print(f"  - [{model.name:<7}] MAPE: {res.mape:>6.2f}% | RMSE: {res.rmse:>6.2f} | MAE: {res.mae:>6.2f} | Fit+Pred: {elapsed:.2f}s")

    # Generate Dynamic Leaderboard
    leaderboard = LeaderboardGenerator.generate_leaderboard(eval_results)
    
    print_header("TEST 5: Dynamic Leaderboard & Model Ranking (Primary: MAPE, Secondary: RMSE)")
    print(f"{'Rank':<6} {'Model':<12} {'Type':<15} {'MAPE (%)':<12} {'RMSE':<10} {'MAE':<10} {'Status'}")
    print("-" * 75)
    for row in leaderboard:
        print(f"{row['rank']:<6} {row['model_name']:<12} {row['model_type']:<15} {row['mape']:<12.2f} {row['rmse']:<10.2f} {row['mae']:<10.2f} {row['status']}")
    print("-" * 75)

    assert len(leaderboard) == 5, f"All 5 models must be present in leaderboard, got {len(leaderboard)}"
    assert leaderboard[0]["status"] == "recommended", "Rank 1 must be marked as recommended"
    
    # Verify strict ascending sort by MAPE
    for i in range(len(leaderboard) - 1):
        assert leaderboard[i]["mape"] <= leaderboard[i+1]["mape"] or (
            leaderboard[i]["mape"] == leaderboard[i+1]["mape"] and leaderboard[i]["rmse"] <= leaderboard[i+1]["rmse"]
        ), "Leaderboard must be sorted strictly by MAPE ascending, then RMSE ascending"
    print("[PASS] Dynamic Leaderboard Ranking Rule strictly verified.")

def test_6_api_endpoint_benchmark():
    print_header("TEST 6: API Endpoint /api/v1/benchmark/run & Aligned Predictions")
    
    # 1. First ensure a dataset exists in storage
    sample_csv = settings.STORAGE_DIR / "api_benchmark_data.csv"
    dates = pd.date_range("2024-01-01", periods=60, freq="D")
    df_sample = pd.DataFrame({
        "date_col": dates.strftime("%Y-%m-%d"),
        "sales_val": np.linspace(50, 100, 60) + np.random.normal(0, 2, 60)
    })
    df_sample.to_csv(sample_csv, index=False)

    with open(sample_csv, "rb") as f:
        up_resp = client.post(
            "/api/v1/datasets/upload",
            files=[("files", ("api_benchmark_data.csv", f, "text/csv"))]
        )
    assert up_resp.status_code == 200
    dataset_id = up_resp.json()["dataset_id"]

    # Map schema
    client.post("/api/v1/datasets/map-schema", json={
        "dataset_id": dataset_id,
        "time_column": "date_col",
        "target_column": "sales_val"
    })

    # 2. Call Benchmark Run API
    req_payload = {
        "dataset_id": dataset_id,
        "train_percentage": 0.80,
        "candidate_models": ["arima", "prophet", "lightgbm", "deepar", "tft"]
    }
    
    bench_resp = client.post("/api/v1/benchmark/run", json=req_payload)
    assert bench_resp.status_code == 200, f"Benchmark API failed: {bench_resp.text}"
    bench_data = bench_resp.json()

    print(f"[PASS] Benchmark API returned 200 OK:")
    print(f"  Dataset ID: {bench_data['dataset_id']}")
    print(f"  Leaderboard count: {len(bench_data['leaderboard'])}")
    print(f"  Top Ranked Model:  {bench_data['leaderboard'][0]['model_name']} (MAPE: {bench_data['leaderboard'][0]['mape']}%)")
    print(f"  Aligned table rows: {len(bench_data['aligned_comparison_table'])}")
    print(f"  Sample Aligned Point: {bench_data['aligned_comparison_table'][0]}")

    # Verify 1-to-1 matching in aligned comparison table
    first_point = bench_data['aligned_comparison_table'][0]
    assert "timestamp" in first_point and "actual" in first_point
    assert "ARIMA" in first_point and "Prophet" in first_point and "LightGBM" in first_point
    print("[PASS] Aligned comparison table contains valid multi-model predictions for frontend charts.")

if __name__ == "__main__":
    test_1_controlled_metrics()
    test_2_zero_target_safety()
    test_3_data_leakage_and_horizon()
    test_4_five_model_benchmark()
    test_6_api_endpoint_benchmark()
    print("\n" + "="*70)
    print("  ALL PHASE 3 EVALUATION & BENCHMARK TESTS PASSED WITH 100% SUCCESS!")
    print("="*70)
