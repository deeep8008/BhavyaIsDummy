import sys
import time
from pathlib import Path
import pandas as pd
import numpy as np

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.models.model_factory import ModelFactory
from app.models.base_forecaster import BaseForecaster, ForecastOutput

def print_header(title: str):
    print("\n" + "="*65)
    print(f"  {title}")
    print("="*65)

def run_phase2_tests():
    print_header("PHASE 2: FORECASTING ENGINE & MODEL ADAPTER VERIFICATION")
    
    # 1. Create a controlled synthetic canonical dataset (60 days)
    np.random.seed(42)
    dates = pd.date_range("2024-01-01", periods=60, freq="D")
    trend = np.linspace(50, 100, 60)
    seasonality = 15 * np.sin(np.linspace(0, 6 * np.pi, 60))
    noise = np.random.normal(0, 3, 60)
    target_values = np.maximum(10, trend + seasonality + noise)

    df_full = pd.DataFrame({
        "series_id": "test_series_1",
        "timestamp": dates,
        "target": target_values
    })

    # Chronological Split: 45 days train / 15 days hidden test
    train_df = df_full.iloc[:45].copy().reset_index(drop=True)
    test_df = df_full.iloc[45:].copy().reset_index(drop=True)
    horizon = len(test_df)

    print(f"Dataset Overview:")
    print(f"  Total Days: {len(df_full)}")
    print(f"  Training Period (fit input):  {train_df['timestamp'].min().date()} to {train_df['timestamp'].max().date()} ({len(train_df)} days)")
    print(f"  Hidden Test Period (horizon): {test_df['timestamp'].min().date()} to {test_df['timestamp'].max().date()} ({horizon} days)")
    print(f"  Available Candidate Models:  {[m['key'] for m in ModelFactory.list_available_models()]}")

    models_to_test = [
        ("arima", {"order": (1, 1, 0)}),
        ("prophet", {}),
        ("lightgbm", {"n_estimators": 50}),
        ("deepar", {"n_epochs": 10, "input_chunk_length": 14}),
        ("tft", {"n_epochs": 10, "input_chunk_length": 14, "output_chunk_length": 7})
    ]

    results = []

    for model_key, params in models_to_test:
        print_header(f"TESTING MODEL: {model_key.upper()}")
        
        # 1. Instantiation via ModelFactory
        model = ModelFactory.get_model(model_key, model_params=params)
        assert isinstance(model, BaseForecaster), f"{model_key} must inherit from BaseForecaster"
        print(f"[PASS] Instantiated {model.name} (Type: {model.model_type})")

        # 2. Strict Training on Train Split only
        start_train = time.time()
        model.fit(train_df)
        train_duration = time.time() - start_train
        assert model.is_fitted, f"{model_key} must be marked as is_fitted=True"
        print(f"[PASS] Model trained strictly on {len(train_df)} days in {train_duration:.2f}s (Zero data leakage)")

        # 3. Predict Requested Horizon
        start_pred = time.time()
        output = model.predict(horizon_steps=horizon)
        pred_duration = time.time() - start_pred

        assert isinstance(output, ForecastOutput), f"Output must be ForecastOutput instance, got {type(output)}"
        assert len(output.predictions) == horizon, f"Expected {horizon} predictions, got {len(output.predictions)}"
        assert len(output.timestamps) == horizon, f"Expected {horizon} timestamps, got {len(output.timestamps)}"
        assert not any(np.isnan(p) for p in output.predictions), "Predictions must not contain NaN"
        
        print(f"[PASS] Generated {len(output.predictions)} future horizon predictions in {pred_duration:.2f}s")
        print(f"  Predicted Timestamps: {output.timestamps[0]} -> {output.timestamps[-1]}")
        print(f"  First 3 Predictions:  {output.predictions[:3]}")
        print(f"  Last 3 Predictions:   {output.predictions[-3:]}")

        # 4. Verify Confidence Intervals
        if output.lower_bound_80 and output.upper_bound_80:
            print(f"  80% Uncertainty CI:   [{output.lower_bound_80[0]} ... {output.upper_bound_80[0]}]")
        if output.lower_bound_95 and output.upper_bound_95:
            print(f"  95% Uncertainty CI:   [{output.lower_bound_95[0]} ... {output.upper_bound_95[0]}]")

        results.append({
            "key": model_key,
            "name": model.name,
            "type": model.model_type,
            "train_time": round(train_duration, 2),
            "status": "PASSED"
        })

    print_header("PHASE 2 MODEL ENGINE VERIFICATION SUMMARY")
    print(f"{'Key':<12} {'Model Name':<30} {'Type':<16} {'Train Time':<12} {'Status'}")
    print("-" * 75)
    for r in results:
        print(f"{r['key']:<12} {r['name']:<30} {r['type']:<16} {str(r['train_time'])+'s':<12} {r['status']}")
    print("=" * 75)
    print("  ALL 5 CANDIDATE FORECASTING MODELS VERIFIED SUCCESSFULLY!")
    print("=" * 75)

if __name__ == "__main__":
    run_phase2_tests()
