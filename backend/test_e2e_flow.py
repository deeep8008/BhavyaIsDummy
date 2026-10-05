import urllib.request
import json
import io
import datetime

# 1. Upload a CSV file
boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = io.BytesIO()
body.write(f"--{boundary}\r\n".encode("utf-8"))
body.write(b'Content-Disposition: form-data; name="files"; filename="test_sales.csv"\r\n')
body.write(b"Content-Type: text/csv\r\n\r\n")

csv_content = "date,sales,product_id\n"
base = datetime.date(2023, 1, 1)
for i in range(100):
    d = base + datetime.timedelta(days=i)
    csv_content += f"{d},{100 + i % 20},PROD_1\n"

body.write(csv_content.encode("utf-8"))
body.write(f"\r\n--{boundary}--\r\n".encode("utf-8"))

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/v1/datasets/upload",
    data=body.getvalue(),
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)
with urllib.request.urlopen(req) as resp:
    upload_res = json.loads(resp.read().decode())
    ds_id = upload_res["dataset_id"]
    print("1. Uploaded dataset ID:", ds_id)
    print("   Available columns:", upload_res["available_columns"])

# 2. Map schema
map_payload = json.dumps({
    "dataset_id": ds_id,
    "time_column": "date",
    "target_column": "sales",
    "series_id_column": "product_id",
    "dynamic_covariates": [],
    "static_covariates": []
}).encode("utf-8")
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/v1/datasets/map-schema",
    data=map_payload,
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as resp:
    map_res = json.loads(resp.read().decode())
    print("2. Schema Mapped! Rows:", map_res["canonical_rows_count"])

# 3. Run Benchmark
bench_payload = json.dumps({
    "dataset_id": ds_id,
    "candidate_models": ["arima", "prophet", "lightgbm", "deepar", "tft"],
    "train_percentage": 0.80
}).encode("utf-8")
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/v1/benchmark/run",
    data=bench_payload,
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as resp:
    bench_res = json.loads(resp.read().decode())
    print("3. Benchmark SUCCESS! Leaderboard:")
    for r in bench_res["leaderboard"]:
        print(f"   Rank #{r['rank']}: {r['model_name']} | MAPE: {r['mape']:.2f}% | RMSE: {r['rmse']:.2f}")

# 4. Run Future Forecast
forecast_payload = json.dumps({
    "dataset_id": ds_id,
    "model": "lightgbm",
    "horizon": 28,
    "series_id": "PROD_1",
    "current_inventory": 500
}).encode("utf-8")
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/v1/forecast/run",
    data=forecast_payload,
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as resp:
    fc_res = json.loads(resp.read().decode())
    print("4. Future Forecast SUCCESS!")
    print("   Projected Volume:", fc_res["insights"]["total_projected_volume"])
    print("   Daily Avg:", fc_res["insights"]["average_daily_demand"])
    print("   Forecast points:", len(fc_res["forecast"]))
