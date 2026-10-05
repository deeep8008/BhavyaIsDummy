// ForecastIQ API Service Layer
// Connects to FastAPI Backend at http://127.0.0.1:8000/api/v1

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Generic request helper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = options.headers || {};

  // If body is not FormData and not string, stringify JSON
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.detail || `API error: ${response.status} ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // --- Datasets ---
  async uploadDataset(files, datasetName = null) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    if (datasetName) {
      formData.append('dataset_name', datasetName);
    }

    return request('/datasets/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async mapSchema(mappingPayload) {
    return request('/datasets/map-schema', {
      method: 'POST',
      body: mappingPayload,
    });
  },

  async exploreDataset(datasetId) {
    return request(`/datasets/${encodeURIComponent(datasetId)}/explore`, {
      method: 'GET',
    });
  },

  async preloadM5(preloadOptions = {}) {
    return request('/datasets/preload-m5', {
      method: 'POST',
      body: {
        aggregation_level: preloadOptions.aggregation_level || 'total',
        max_days: preloadOptions.max_days || null,
        max_series: preloadOptions.max_series || 10,
      },
    });
  },

  async listDatasets() {
    return request('/datasets/list', {
      method: 'GET',
    });
  },

  // --- Pipeline & Split ---
  async splitDataset(splitConfig) {
    return request('/pipeline/split', {
      method: 'POST',
      body: {
        dataset_id: splitConfig.dataset_id,
        train_percentage: splitConfig.train_percentage ?? 0.80,
        fixed_test_days: splitConfig.fixed_test_days ?? null,
        series_id: splitConfig.series_id ?? null,
      },
    });
  },

  // --- Benchmark & Model Evaluation (Phase 3) ---
  async runBenchmark(benchmarkConfig) {
    return request('/benchmark/run', {
      method: 'POST',
      body: {
        dataset_id: benchmarkConfig.dataset_id,
        train_percentage: benchmarkConfig.train_percentage ?? 0.80,
        fixed_test_days: benchmarkConfig.fixed_test_days ?? null,
        candidate_models: benchmarkConfig.candidate_models || ['arima', 'prophet', 'lightgbm', 'deepar', 'tft'],
        series_id: benchmarkConfig.series_id ?? null,
      },
    });
  },

  async getBenchmarkResults(datasetId) {
    return request(`/benchmark/${encodeURIComponent(datasetId)}/results`, {
      method: 'GET',
    });
  },

  // --- Future Forecast & Business Insights (Phase 4) ---
  async runForecast(forecastConfig) {
    return request('/forecast/run', {
      method: 'POST',
      body: {
        dataset_id: forecastConfig.dataset_id,
        model: forecastConfig.model || 'prophet',
        horizon: forecastConfig.horizon ?? 28,
        series_id: forecastConfig.series_id ?? null,
        current_inventory: forecastConfig.current_inventory !== undefined && forecastConfig.current_inventory !== '' 
          ? Number(forecastConfig.current_inventory) 
          : null,
      },
    });
  },

  async getForecastResults(forecastId) {
    return request(`/forecast/${encodeURIComponent(forecastId)}/results`, {
      method: 'GET',
    });
  },

  // --- Health Check ---
  async checkHealth() {
    try {
      const res = await fetch('http://127.0.0.1:8000/health');
      return res.ok;
    } catch {
      return false;
    }
  }
};
