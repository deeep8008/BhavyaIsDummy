import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart2, 
  Filter, 
  HelpCircle, 
  TrendingUp, 
  Info, 
  ChevronRight,
  ShieldCheck,
  Layers,
  ArrowUpDown,
  Sparkles,
  Play,
  Check,
  Zap
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

export default function ModelComparisonPage({ onNavigate }) {
  const { 
    activeDatasetId, 
    datasetSummary, 
    benchmarkResults, 
    runBenchmark, 
    selectedModel, 
    setSelectedModel, 
    isLoading,
    loadingMessage
  } = useDataset();

  const [activeMetricTab, setActiveMetricTab] = useState('mape'); // 'mape' or 'rmse'
  const [selectedChartModel, setSelectedChartModel] = useState('all'); // 'all' or specific model_key

  const handleRunBenchmark = () => {
    runBenchmark().catch(() => {});
  };

  const handleSelectModelForForecast = (modelKey) => {
    setSelectedModel(modelKey);
    onNavigate('forecast');
  };

  const leaderboard = benchmarkResults?.leaderboard || [];
  const testActuals = benchmarkResults?.test_actuals || [];
  const testTimestamps = benchmarkResults?.test_timestamps || [];
  const modelPredictions = benchmarkResults?.model_predictions || {};

  // Maximum value for chart scaling
  const chartMax = useMemo(() => {
    let max = 0;
    testActuals.forEach(v => { if (v > max) max = v; });
    Object.values(modelPredictions).forEach(preds => {
      preds.forEach(v => { if (v > max) max = v; });
    });
    return Math.ceil((max * 1.15) / 10) * 10 || 100;
  }, [testActuals, modelPredictions]);

  // Model color mapping
  const modelColors = {
    arima: '#E11D48',
    prophet: '#3B82F6',
    lightgbm: '#10B981',
    deepar: '#F59E0B',
    tft: '#A294F9',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
            Historical Backtesting & Evaluation (Phase 3)
          </div>
          <h1 className="text-3xl font-bold font-heading text-[#1F1B2C]">
            Model Comparison & Dynamic Leaderboard
          </h1>
          <p className="text-sm text-[#5F5670] mt-1 max-w-2xl">
            Objective evaluation of statistical baselines, gradient boosting, and deep transformer architectures evaluated on untouched hidden holdout sales.
          </p>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A294F9] text-white text-xs font-bold hover:bg-[#9181f7] shadow-xs cursor-pointer shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isLoading ? 'Running Backtest...' : 'Re-Run 5-Model Benchmark'}</span>
        </button>
      </div>

      {/* Dynamic Leaderboard Table */}
      <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F5EFFF]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Dynamic Leaderboard
            </div>
            <h2 className="text-xl font-bold font-heading text-[#1F1B2C]">
              Model Accuracy Ranking on Hidden Test Set
            </h2>
            <p className="text-xs text-[#5F5670]">
              Ranking Rule: <strong>Primary: MAPE (ascending)</strong>, Tie-Breaker: <strong>RMSE (ascending)</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              0% Lookahead Data Leakage
            </span>
          </div>
        </div>

        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5D9F2] text-[#8E83A3] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Rank</th>
                  <th className="py-3 px-4 font-semibold">Model Architecture</th>
                  <th className="py-3 px-4 font-semibold">Class</th>
                  <th className="py-3 px-4 font-semibold">Backtested MAPE (%)</th>
                  <th className="py-3 px-4 font-semibold">RMSE (Units)</th>
                  <th className="py-3 px-4 font-semibold">MAE</th>
                  <th className="py-3 px-4 font-semibold">Training Latency</th>
                  <th className="py-3 px-4 font-semibold text-right">Model Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EFFF]">
                {leaderboard.map((row) => {
                  const isWinner = row.rank === 1;
                  const isSelected = selectedModel === row.model_key;
                  return (
                    <tr 
                      key={row.model_key} 
                      className={`transition-colors ${
                        isWinner ? 'bg-[#F5EFFF]/70 font-medium' : 'hover:bg-[#F5EFFF]/30'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isWinner 
                            ? 'bg-[#A294F9] text-white shadow-xs' 
                            : 'bg-[#E5D9F2] text-[#5F5670]'
                        }`}>
                          #{row.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1F1B2C] flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: modelColors[row.model_key] || '#A294F9' }}
                          />
                          <span>{row.model_name}</span>
                          {isWinner && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                              WINNER
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#5F5670]">
                        {row.model_type}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1F1B2C]">
                        <span className={isWinner ? 'text-emerald-700 font-extrabold text-sm' : ''}>
                          {row.mape.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1F1B2C]">
                        {row.rmse.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-[#5F5670]">
                        {row.mae.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-[#8E83A3] font-mono">
                        {row.train_time_seconds.toFixed(2)}s
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSelectModelForForecast(row.model_key)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#A294F9] text-white shadow-xs'
                              : 'bg-white border border-[#CDC1FF] text-[#1F1B2C] hover:bg-[#F5EFFF]'
                          }`}
                        >
                          {isSelected ? 'Selected for Phase 4 ✓' : 'Select Model →'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#8E83A3]">
            {isLoading ? 'Running 5-model historical backtest on test holdout window...' : 'Click "Re-Run 5-Model Benchmark" to evaluate models on this dataset.'}
          </div>
        )}
      </section>

      {/* Visual Aligned Comparison Overlay Chart */}
      {testActuals.length > 0 && (
        <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
                Holdout Predictions Alignment
              </div>
              <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
                Actual Ground Truth vs Candidate Model Predictions
              </h3>
              <p className="text-xs text-[#5F5670]">
                All models evaluated simultaneously across the exact same {testActuals.length}-day test holdout window.
              </p>
            </div>

            {/* Filter which model to highlight */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E83A3]">Overlay:</span>
              <select
                value={selectedChartModel}
                onChange={(e) => setSelectedChartModel(e.target.value)}
                className="bg-[#F5EFFF] border border-[#CDC1FF] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1F1B2C] outline-none cursor-pointer"
              >
                <option value="all">All 5 Models</option>
                <option value="lightgbm">LightGBM Only</option>
                <option value="prophet">Prophet Only</option>
                <option value="arima">ARIMA Only</option>
                <option value="deepar">DeepAR Only</option>
                <option value="tft">TFT Only</option>
              </select>
            </div>
          </div>

          {/* SVG Overlay Chart */}
          <div className="relative w-full h-72 bg-[#F5EFFF]/30 rounded-2xl border border-[#E5D9F2] p-4 flex flex-col justify-end">
            <svg viewBox="0 0 800 220" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                <line 
                  key={i} 
                  x1="0" 
                  y1={220 - r * 190} 
                  x2="800" 
                  y2={220 - r * 190} 
                  stroke="#E5D9F2" 
                  strokeDasharray="3 3" 
                />
              ))}

              {/* Actual Test Ground Truth (Bold Dark Line) */}
              <path
                d={testActuals.map((v, i) => {
                  const x = (i / Math.max(1, testActuals.length - 1)) * 800;
                  const y = 220 - (v / (chartMax || 1)) * 190;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#1F1B2C"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Model Lines */}
              {Object.entries(modelPredictions).map(([mKey, preds]) => {
                if (selectedChartModel !== 'all' && selectedChartModel !== mKey) return null;
                const strokeCol = modelColors[mKey] || '#A294F9';
                const isTFT = mKey === 'tft';

                return (
                  <path
                    key={mKey}
                    d={preds.map((v, i) => {
                      const x = (i / Math.max(1, preds.length - 1)) * 800;
                      const y = 220 - (v / (chartMax || 1)) * 190;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke={strokeCol}
                    strokeWidth={selectedChartModel === mKey ? '3' : isTFT ? '2.5' : '1.5'}
                    strokeDasharray={mKey === 'arima' ? '4 2' : 'none'}
                    strokeLinejoin="round"
                    opacity={selectedChartModel !== 'all' && selectedChartModel !== mKey ? 0.2 : 0.9}
                  />
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#5F5670] mt-3 pt-2 border-t border-[#E5D9F2]">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 font-bold text-[#1F1B2C]">
                  <span className="w-3.5 h-1 bg-[#1F1B2C] inline-block rounded-full"></span>
                  Actual Sales
                </span>
                {Object.keys(modelPredictions).map(mKey => (
                  <span key={mKey} className="flex items-center gap-1.5 font-medium">
                    <span 
                      className="w-3.5 h-0.5 inline-block rounded-full" 
                      style={{ backgroundColor: modelColors[mKey] }} 
                    />
                    <span className="capitalize">{mKey}</span>
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-[#8E83A3]">
                {testTimestamps[0]} → {testTimestamps[testTimestamps.length - 1]} ({testTimestamps.length} Days)
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Next Step Action Card */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-white via-[#F5EFFF]/50 to-white border border-[#E5D9F2] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-base text-[#1F1B2C]">
            Ready to retrain the selected model on 100% of historical data?
          </div>
          <div className="text-xs text-[#5F5670]">
            Selected model: <strong className="text-[#A294F9] uppercase">{selectedModel}</strong>. Project into the future with confidence intervals.
          </div>
        </div>
        <button
          onClick={() => onNavigate('forecast')}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A294F9] text-white text-xs font-bold hover:bg-[#9181f7] shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>Generate Future Forecast →</span>
        </button>
      </section>
    </div>
  );
}
