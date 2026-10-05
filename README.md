# ForecastIQ — Multi-Horizon Demand Forecasting & Model Evaluation Engine

ForecastIQ is a full-stack, enterprise-grade demand forecasting platform that automates dataset ingestion, chronological 80/20 holdout backtesting across 5 candidate machine learning models, dynamic leaderboard ranking (MAPE & RMSE), and 100% historical retraining for future multi-horizon projections.

---

## ⚡ Quick Start: Running Locally

Follow these steps to run both the **FastAPI Backend** and the **React Frontend** on your machine.

### Prerequisites
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/deeep8008/BhavyaIsDummy.git
cd BhavyaIsDummy
```

---

### 2. Start the Backend (Terminal 1)

The backend powers the data processing, chronological holdout splitter, and 5 ML model algorithms.

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --port 8000
```

> ✅ **Backend will be live at:** `http://127.0.0.1:8000`  
> 📖 **Interactive Swagger API Docs:** `http://127.0.0.1:8000/docs`

---

### 3. Start the Frontend (Terminal 2)

Open a **new separate terminal** in the root project folder:

```bash
# In the root repository directory
npm install

# Start Vite dev server
npm run dev
```

> 🌐 **Frontend will be live at:** `http://localhost:5173/`

---

## 🔄 How the Application Works (3-Step Pipeline)

```
[Upload CSV / Folder / 1-Click M5]
               │
               ▼
[Standardize to Canonical Schema (Timestamp, Target, Series ID)]
               │
               ▼
[80/20 Chronological Split: 80% Train, 20% Hidden Holdout]
               │
               ▼
[Evaluate 5 Models: ARIMA, Prophet, LightGBM, DeepAR, TFT]
               │
               ▼
[Leaderboard Ranking (Primary: MAPE %, Secondary: RMSE)]
               │
               ▼
[Select Champion Model -> 100% Historical Retraining]
               │
               ▼
[Future Projections (7D/14D/28D/90D) + Safety Stock + CSV Export]
```

### 1. Dataset Ingestion & Preloading
- **Single CSV or Multi-CSV Folder**: Drag-and-drop your sales time-series data with automatic CSV validation.
- **1-Click M5 Benchmark**: Instant preloading of the standard Walmart M5 benchmark dataset.
- **Column Mapping**: Interactive schema mapper to designate Date (`timestamp`), Sales (`target`), and Product/Store ID (`series_id`).

### 2. Chronological Backtesting & Dynamic Leaderboard
- **Zero Data Leakage**: Strictly splits data chronologically (first 80% for training, last 20% strictly hidden).
- **5 Candidate ML Models**: Trains **ARIMA**, **Prophet**, **LightGBM**, **DeepAR**, and **TFT** strictly on the 80% training window.
- **True Metrics**: Predicts the hidden 20 days and computes real **MAPE** (Mean Absolute Percentage Error) and **RMSE** (Root Mean Squared Error) against actual sales ground truth.
- **Dynamic Leaderboard**: Automatically ranks models from 1st to 5th (lower error is better, champion marked 🏆).
- **Interactive Holdout Chart**: Visually overlays actual sales against model predictions.

### 3. Future Forecasting (100% Historical Retraining)
- **100% History Fit**: Retrains the selected winning model on all historical observations so recent demand trends are captured.
- **Multi-Horizon Projection**: Forecasts ahead by **7D, 14D, 28D, or 90D**.
- **Confidence Intervals**: Computes 80% and 95% uncertainty cones.
- **Supply Chain Insights**: Recommends safety stock buffers, peak demand dates, and stockout risk estimates based on on-hand warehouse inventory.
- **1-Click CSV Export**: Downloads complete future numbers for supply chain and ERP systems.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Custom SVG Time-Series Charts.
- **Backend**: FastAPI, Uvicorn, Pydantic v2, Pandas, NumPy, PyArrow.
- **Machine Learning**: LightGBM, Prophet, Statsmodels (ARIMA/SARIMAX), Scikit-Learn, PyTorch.
- **Storage**: Canonical Parquet engine with fast local caching.

---

## 🧪 Running Backend Unit Tests

To verify all backend phases and model pipelines:

```bash
cd backend
python -m pytest test_phase1.py test_phase2.py test_phase3.py test_phase4.py -v
```
