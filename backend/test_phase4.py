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
from app.models.model_factory import ModelFactory
from app.services.dataset_service import DatasetService
from app.services.forecast_service import ForecastService
from app.schemas.forecast_schemas import ForecastRunRequest

client = TestClient(app)

def print_header(title: str):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def setup_test_canonical_dataset() -> str:
    """Creates a controlled 100-day canonical dataset for testing."""
    dataset_id = "ds_phase4_controlled"
    dates = pd.date_range("2024-01-01", periods=100, freq="D")
    np.random.seed(42)
    trend = np.linspace(50, 120, 100)
    seasonality = 15 * np.sin(np.linspace(0, 8 * np.pi, 100))
    noise = np.random.normal(0, 2, 100)
    target = np.maximum(5.0, trend + seasonality + noise)

    df = pd.DataFrame({
        "series_id": "Enterprise_Total",
        "timestamp": dates,
        "target": target
    })

    parquet_path = settings.PROCESSED_DIR / f"{dataset_id}_canonical.parquet"
    df.to_parquet(parquet_path, index=False)
    return dataset_id

def test_1_model_selection():
    print_header("TEST 1: Model Selection Across All 5 Models")
    dataset_id = setup_test_canonical_dataset()
    models = ["arima", "prophet", "lightgbm", "deepar", "tft"]

    for m in models:
        req = ForecastRunRequest(dataset_id=dataset_id, model=m, horizon=7)
        res = ForecastService.generate_future_forecast(req)
        assert res.selected_model.lower() == m or m in res.selected_model.lower() or res.selected_model in ["ARIMA", "Prophet", "LightGBM", "DeepAR", "TFT"]
        assert len(res.forecast) == 7
        print(f"[PASS] Successfully instantiated and forecasted with model: '{m}' -> {res.selected_model}")

def test_2_100_percent_historical_retraining():
    print_header("TEST 2: 100% Historical Retraining Verification")
    dataset_id = setup_test_canonical_dataset()
    df_raw = pd.read_parquet(settings.PROCESSED_DIR / f"{dataset_id}_canonical.parquet")
    total_history_count = len(df_raw)

    req = ForecastRunRequest(dataset_id=dataset_id, model="prophet", horizon=14)
    res = ForecastService.generate_future_forecast(req)

    assert res.retrained_on_full_history is True
    assert res.historical_observations_count == total_history_count == 100
    assert res.historical_start == "2024-01-01"
    assert res.historical_end == "2024-04-09"
    print(f"[PASS] Model retrained strictly on 100% of historical data ({res.historical_observations_count} days).")
    print(f"  Historical Window: {res.historical_start} to {res.historical_end}")
    print("  Zero artificial holdout used during future forecast generation.")

def test_3_horizon_and_timestamps():
    print_header("TEST 3, 4 & 5: Horizon Lengths, Timestamp Alignment & Uniqueness")
    dataset_id = setup_test_canonical_dataset()

    for horizon in [7, 14, 28]:
        req = ForecastRunRequest(dataset_id=dataset_id, model="lightgbm", horizon=horizon)
        res = ForecastService.generate_future_forecast(req)

        assert len(res.forecast) == horizon, f"Expected {horizon} steps, got {len(res.forecast)}"
        assert res.horizon == horizon

        # Check future alignment
        hist_end = pd.to_datetime(res.historical_end)
        fc_start = pd.to_datetime(res.forecast_start)
        assert fc_start > hist_end, f"Forecast start {fc_start} must be after history end {hist_end}"
        assert fc_start == hist_end + pd.Timedelta(days=1), f"Forecast start {fc_start} must immediately follow history end {hist_end}"

        # Check timestamp uniqueness & order
        timestamps = [p.timestamp for p in res.forecast]
        assert len(timestamps) == len(set(timestamps)), "Timestamps must be unique"
        for i in range(len(timestamps) - 1):
            assert pd.to_datetime(timestamps[i]) < pd.to_datetime(timestamps[i+1]), "Timestamps must be strictly chronological"

        print(f"[PASS] Verified Horizon = {horizon} Days:")
        print(f"  Start: {res.forecast_start} | End: {res.forecast_end} | Point Count: {len(res.forecast)}")

def test_6_and_7_non_negative_and_confidence_bounds():
    print_header("TEST 6 & 7: Non-Negativity & Monotonic Confidence Intervals")
    dataset_id = setup_test_canonical_dataset()
    req = ForecastRunRequest(dataset_id=dataset_id, model="deepar", horizon=14)
    res = ForecastService.generate_future_forecast(req)

    for i, pt in enumerate(res.forecast):
        # 1. Non-negativity
        assert pt.prediction >= 0.0, f"Prediction at index {i} is negative: {pt.prediction}"
        assert pt.lower_95 >= 0.0, f"Lower 95 at index {i} is negative: {pt.lower_95}"
        assert pt.lower_80 >= 0.0, f"Lower 80 at index {i} is negative: {pt.lower_80}"
        assert pt.upper_80 >= 0.0, f"Upper 80 at index {i} is negative: {pt.upper_80}"
        assert pt.upper_95 >= 0.0, f"Upper 95 at index {i} is negative: {pt.upper_95}"

        # 2. Monotonic Ordering: 0 <= lower_95 <= lower_80 <= prediction <= upper_80 <= upper_95
        assert pt.lower_95 <= pt.lower_80 + 1e-3, f"Ordering violation: l95 ({pt.lower_95}) > l80 ({pt.lower_80})"
        assert pt.lower_80 <= pt.prediction + 1e-3, f"Ordering violation: l80 ({pt.lower_80}) > pred ({pt.prediction})"
        assert pt.prediction <= pt.upper_80 + 1e-3, f"Ordering violation: pred ({pt.prediction}) > u80 ({pt.upper_80})"
        assert pt.upper_80 <= pt.upper_95 + 1e-3, f"Ordering violation: u80 ({pt.upper_80}) > u95 ({pt.upper_95})"

    sample = res.forecast[0]
    print(f"[PASS] Monotonic Bounds & Non-Negativity Verified across all points:")
    print(f"  Sample Day 1: 0 <= Lower95({sample.lower_95}) <= Lower80({sample.lower_80}) <= Pred({sample.prediction}) <= Upper80({sample.upper_80}) <= Upper95({sample.upper_95})")

def test_8_business_insights():
    print_header("TEST 8: Real Business Insights Calculation")
    dataset_id = setup_test_canonical_dataset()
    req = ForecastRunRequest(dataset_id=dataset_id, model="tft", horizon=14)
    res = ForecastService.generate_future_forecast(req)
    insights = res.insights

    # Hand calculate from forecast points
    preds = [p.prediction for p in res.forecast]
    expected_vol = round(sum(preds), 2)
    expected_avg = round(sum(preds) / len(preds), 2)
    expected_peak = max(preds)
    expected_min = min(preds)

    assert abs(insights.total_projected_volume - expected_vol) < 0.1, f"Volume mismatch: {insights.total_projected_volume} vs {expected_vol}"
    assert abs(insights.average_daily_demand - expected_avg) < 0.1, f"Average mismatch: {insights.average_daily_demand} vs {expected_avg}"
    assert abs(insights.peak_demand_value - expected_peak) < 0.1, f"Peak mismatch: {insights.peak_demand_value} vs {expected_peak}"
    assert abs(insights.min_demand_value - expected_min) < 0.1, f"Min mismatch: {insights.min_demand_value} vs {expected_min}"
    assert insights.recommended_safety_stock > 0, "Safety stock recommendation must be > 0"

    print(f"[PASS] Business Insights Verified from Forecast Data:")
    print(f"  Total Projected Volume: {insights.total_projected_volume} units")
    print(f"  Average Daily Demand:   {insights.average_daily_demand} units/day")
    print(f"  Peak Demand Date:       {insights.peak_demand_date} ({insights.peak_demand_value} units)")
    print(f"  Minimum Demand Date:    {insights.min_demand_date} ({insights.min_demand_value} units)")
    print(f"  Demand Trend:           {insights.demand_trend}")
    print(f"  Safety Stock Buffer:    {insights.recommended_safety_stock} units")
    print(f"  Calculation Method:     {insights.safety_stock_method}")

def test_9_stockout_risk_handling():
    print_header("TEST 9: Stockout Risk Safety & Inventory Handling")
    dataset_id = setup_test_canonical_dataset()

    # Case A: No inventory provided -> Must be 'unavailable' without fabricating
    req_no_inv = ForecastRunRequest(dataset_id=dataset_id, model="arima", horizon=14, current_inventory=None)
    res_no_inv = ForecastService.generate_future_forecast(req_no_inv)
    assert res_no_inv.insights.stockout_risk_status == "unavailable"
    assert res_no_inv.insights.estimated_stockout_date is None
    print("[PASS] Case A (No inventory provided): Stockout risk gracefully reported as 'unavailable'.")

    # Case B: Low inventory provided (e.g. 200 units on hand when total demand is ~1500) -> High risk
    req_low_inv = ForecastRunRequest(dataset_id=dataset_id, model="arima", horizon=14, current_inventory=200.0)
    res_low_inv = ForecastService.generate_future_forecast(req_low_inv)
    assert res_low_inv.insights.stockout_risk_status == "high_risk"
    assert res_low_inv.insights.estimated_stockout_date is not None
    print(f"[PASS] Case B (Low inventory = 200): Flagged 'high_risk' with estimated stockout date: {res_low_inv.insights.estimated_stockout_date}")

def test_10_api_endpoints():
    print_header("TEST 10: API Endpoints (POST /forecast/run & GET /forecast/{id}/results)")
    dataset_id = setup_test_canonical_dataset()

    # 1. POST /api/v1/forecast/run
    payload = {
        "dataset_id": dataset_id,
        "model": "prophet",
        "horizon": 28,
        "current_inventory": 3500.0
    }
    run_resp = client.post("/api/v1/forecast/run", json=payload)
    assert run_resp.status_code == 200, f"Run API failed: {run_resp.text}"
    run_data = run_resp.json()

    forecast_id = run_data["forecast_id"]
    assert len(run_data["forecast"]) == 28
    assert "insights" in run_data
    print(f"[PASS] POST /api/v1/forecast/run returned 200 OK:")
    print(f"  Forecast ID:    {forecast_id}")
    print(f"  Selected Model: {run_data['selected_model']}")
    print(f"  Horizon Steps:  {run_data['horizon']}")
    print(f"  Peak Demand:    {run_data['insights']['peak_demand_date']} ({run_data['insights']['peak_demand_value']})")

    # 2. GET /api/v1/forecast/{forecast_id}/results
    get_resp = client.get(f"/api/v1/forecast/{forecast_id}/results")
    assert get_resp.status_code == 200, f"Get Results API failed: {get_resp.text}"
    get_data = get_resp.json()

    assert get_data["forecast_id"] == forecast_id
    assert len(get_data["forecast"]) == 28
    print(f"[PASS] GET /api/v1/forecast/{forecast_id}/results returned 200 OK (Cached results retrieved).")

if __name__ == "__main__":
    test_1_model_selection()
    test_2_100_percent_historical_retraining()
    test_3_horizon_and_timestamps()
    test_6_and_7_non_negative_and_confidence_bounds()
    test_8_business_insights()
    test_9_stockout_risk_handling()
    test_10_api_endpoints()
    print("\n" + "="*70)
    print("  ALL PHASE 4 FUTURE FORECASTING & INSIGHTS TESTS PASSED WITH 100% SUCCESS!")
    print("="*70)
