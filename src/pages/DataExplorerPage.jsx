import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  Calendar, 
  DollarSign, 
  Layers, 
  Database, 
  TrendingUp, 
  Info,
  CheckCircle,
  Clock,
  Sparkles,
  UploadCloud,
  Sliders,
  Scissors
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

export default function DataExplorerPage({ onNavigate }) {
  const { 
    activeDatasetId, 
    datasetSummary, 
    selectedSeriesId, 
    setSelectedSeriesId,
    splitMetadata,
    runSplit,
    setIsUploadModalOpen,
    isLoading,
    loadingMessage
  } = useDataset();

  const [dateWindow, setDateWindow] = useState('90d');
  const [showMovingAvg, setShowMovingAvg] = useState(true);
  const [trainPct, setTrainPct] = useState(80);
  const [splitSuccessMsg, setSplitSuccessMsg] = useState('');

  // Extract series IDs
  const availableSeries = useMemo(() => {
    return datasetSummary?.series_ids || ['total'];
  }, [datasetSummary]);

  // Extract raw records for the active series
  const rawRecords = useMemo(() => {
    if (!datasetSummary?.sample_records) return [];
    return datasetSummary.sample_records.map(r => ({
      date: r.timestamp,
      sales: Number(r.target || 0),
    }));
  }, [datasetSummary]);

  // Filter by date window (30d, 90d, 180d, all)
  const filteredRecords = useMemo(() => {
    if (rawRecords.length === 0) return [];
    const count = dateWindow === '30d' ? 30 : dateWindow === '90d' ? 90 : dateWindow === '180d' ? 180 : rawRecords.length;
    const slice = rawRecords.slice(-count);

    // Calculate 7-day moving average
    return slice.map((item, idx, arr) => {
      const windowStart = Math.max(0, idx - 6);
      const windowItems = arr.slice(windowStart, idx + 1);
      const avg = Math.round(windowItems.reduce((acc, curr) => acc + curr.sales, 0) / windowItems.length);
      return { ...item, rollingAvg: avg };
    });
  }, [rawRecords, dateWindow]);

  const maxVal = useMemo(() => {
    let max = 0;
    filteredRecords.forEach(r => {
      if (r.sales > max) max = r.sales;
    });
    return max || 100;
  }, [filteredRecords]);

  // Handle train/test split execution
  const handleSplitConfig = async () => {
    setSplitSuccessMsg('');
    try {
      const res = await runSplit(trainPct / 100);
      setSplitSuccessMsg(`Dataset successfully split: ${res.train_observations} train observations, ${res.test_observations} hidden test observations.`);
    } catch {
      // Error handled in context
    }
  };

  const targetStats = datasetSummary?.target_stats || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
            Canonical Dataset Exploration (Phase 1)
          </div>
          <h1 className="text-3xl font-bold font-heading text-[#1F1B2C]">
            Data Explorer
          </h1>
          <p className="text-sm text-[#5F5670] mt-1 max-w-2xl">
            Inspect canonical time-series velocity, frequency regularization, missing value imputations, and train/test boundaries.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#CDC1FF] text-xs font-semibold text-[#1F1B2C] hover:bg-[#F5EFFF] shadow-xs cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-[#A294F9]" />
          <span>Upload / Switch Dataset</span>
        </button>
      </div>

      {/* Top Filter Bar */}
      <section className="p-5 rounded-2xl bg-white border border-[#E5D9F2] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
          {/* Active Dataset */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              1. Active Dataset ID
            </label>
            <div className="bg-[#F5EFFF] border border-[#CDC1FF] rounded-xl px-3 py-2 text-xs font-bold text-[#1F1B2C] truncate">
              {datasetSummary?.dataset_name || activeDatasetId}
            </div>
          </div>

          {/* Series ID Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              2. Series ID Filter
            </label>
            <select
              value={selectedSeriesId || ''}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              className="w-full bg-[#F5EFFF] border border-[#CDC1FF] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1B2C] outline-none"
            >
              {availableSeries.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Date Window */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              3. Date Window
            </label>
            <div className="grid grid-cols-4 gap-1 bg-[#F5EFFF] p-1 rounded-xl border border-[#CDC1FF]">
              {[
                { id: '30d', label: '30D' },
                { id: '90d', label: '90D' },
                { id: '180d', label: '180D' },
                { id: 'all', label: 'All' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setDateWindow(opt.id)}
                  className={`py-1.5 text-center text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    dateWindow === opt.id 
                      ? 'bg-[#A294F9] text-white shadow-xs font-bold' 
                      : 'text-[#5F5670] hover:text-[#1F1B2C]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Moving Average */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              4. Trend Overlay
            </label>
            <button
              onClick={() => setShowMovingAvg(!showMovingAvg)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                showMovingAvg 
                  ? 'bg-[#E5D9F2] text-[#1F1B2C] border-[#CDC1FF]' 
                  : 'bg-white text-[#5F5670] border-[#E5D9F2]'
              }`}
            >
              {showMovingAvg ? '✓ 7-Day Moving Avg Enabled' : '+ Enable 7-Day Moving Avg'}
            </button>
          </div>
        </div>
      </section>

      {/* Section A: Historical Sales Trend */}
      <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Section A
            </div>
            <h2 className="text-xl font-bold font-heading text-[#1F1B2C]">
              Historical Demand Velocity ({dateWindow.toUpperCase()})
            </h2>
            <p className="text-xs text-[#5F5670]">
              Regularized canonical timeline showing daily demand observations.
            </p>
          </div>

          <div className="text-xs text-[#5F5670] bg-[#F5EFFF] px-3 py-1.5 rounded-xl border border-[#CDC1FF]">
            {filteredRecords.length} observations displayed
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="relative w-full h-64 bg-[#F5EFFF]/30 rounded-2xl border border-[#E5D9F2] p-4 flex flex-col justify-end">
          {filteredRecords.length > 0 ? (
            <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible">
              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line 
                  key={i} 
                  x1="0" 
                  y1={200 - ratio * 170} 
                  x2="800" 
                  y2={200 - ratio * 170} 
                  stroke="#E5D9F2" 
                  strokeDasharray="3 3" 
                />
              ))}

              {/* Daily sales points / line */}
              <path
                d={filteredRecords.map((pt, i) => {
                  const x = (i / Math.max(1, filteredRecords.length - 1)) * 800;
                  const y = 200 - (pt.sales / (maxVal || 1)) * 170;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#A294F9"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* 7-Day Moving Avg Line */}
              {showMovingAvg && (
                <path
                  d={filteredRecords.map((pt, i) => {
                    const x = (i / Math.max(1, filteredRecords.length - 1)) * 800;
                    const y = 200 - (pt.rollingAvg / (maxVal || 1)) * 170;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#5F5670"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-[#8E83A3]">
              Loading historical timeline...
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#8E83A3] mt-2">
            <span>{filteredRecords[0]?.date || 'Start'}</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#A294F9] inline-block"></span>
                Daily Target Demand
              </span>
              {showMovingAvg && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#5F5670] inline-block"></span>
                  7-Day Rolling Average
                </span>
              )}
            </div>
            <span>{filteredRecords[filteredRecords.length - 1]?.date || 'End (Cutoff)'}</span>
          </div>
        </div>
      </section>

      {/* Grid: Target Statistics & Train/Test Split Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Target Statistics Card */}
        <section className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Descriptive Statistics
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
              Target Demand Distribution
            </h3>
            <p className="text-xs text-[#5F5670]">
              Mathematical parameters computed directly from the canonical dataset.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F5EFFF] border border-[#E5D9F2]">
              <div className="text-[#8E83A3] text-[10px] uppercase font-bold">Mean Demand</div>
              <div className="font-bold text-base text-[#1F1B2C] mt-0.5">
                {targetStats.mean !== undefined ? targetStats.mean.toFixed(2) : '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EFFF] border border-[#E5D9F2]">
              <div className="text-[#8E83A3] text-[10px] uppercase font-bold">Median Demand</div>
              <div className="font-bold text-base text-[#1F1B2C] mt-0.5">
                {targetStats.median !== undefined ? targetStats.median.toFixed(2) : '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EFFF] border border-[#E5D9F2]">
              <div className="text-[#8E83A3] text-[10px] uppercase font-bold">Standard Dev (σ)</div>
              <div className="font-bold text-base text-[#1F1B2C] mt-0.5">
                {targetStats.std !== undefined ? targetStats.std.toFixed(2) : '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EFFF] border border-[#E5D9F2]">
              <div className="text-[#8E83A3] text-[10px] uppercase font-bold">Minimum Demand</div>
              <div className="font-bold text-base text-[#1F1B2C] mt-0.5">
                {targetStats.min !== undefined ? targetStats.min : '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EFFF] border border-[#E5D9F2]">
              <div className="text-[#8E83A3] text-[10px] uppercase font-bold">Maximum Peak</div>
              <div className="font-bold text-base text-[#A294F9] mt-0.5">
                {targetStats.max !== undefined ? targetStats.max : '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EFFF] border border-[#E5D9F2]">
              <div className="text-[#8E83A3] text-[10px] uppercase font-bold">Zero-Value Rows</div>
              <div className="font-bold text-base text-emerald-600 mt-0.5">
                {targetStats.zero_count !== undefined ? targetStats.zero_count : '—'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F5EFFF]/70 border border-[#E5D9F2] space-y-1 text-xs text-[#5F5670]">
            <div className="flex justify-between">
              <span>Missing Values Detected:</span>
              <span className="font-semibold text-[#1F1B2C]">{datasetSummary?.missing_values_found ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Missing Timestamps Imputed:</span>
              <span className="font-semibold text-emerald-600">{datasetSummary?.missing_values_imputed ?? 0} (Forward filled & 0-padded)</span>
            </div>
            <div className="flex justify-between">
              <span>Detected Frequency:</span>
              <span className="font-semibold text-[#A294F9]">{datasetSummary?.frequency || 'D (Daily)'}</span>
            </div>
          </div>
        </section>

        {/* Chronological Train/Test Split Configuration */}
        <section className="lg:col-span-6 p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Pipeline Configuration
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
              Chronological Train / Test Split
            </h3>
            <p className="text-xs text-[#5F5670]">
              Configure the training window and hidden holdout test set with guaranteed 0% data leakage.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1F1B2C]">
              <span>Training Percentage:</span>
              <span className="text-[#A294F9] font-bold text-sm">{trainPct}% Training / {100 - trainPct}% Hidden Test</span>
            </div>

            <input 
              type="range"
              min="50"
              max="95"
              step="5"
              value={trainPct}
              onChange={(e) => setTrainPct(Number(e.target.value))}
              className="w-full accent-[#A294F9] cursor-pointer"
            />

            {/* Visual Split Bar */}
            <div className="w-full flex h-6 rounded-xl overflow-hidden border border-[#CDC1FF] text-[10px] font-bold">
              <div 
                className="bg-[#E5D9F2] text-[#5F5670] flex items-center justify-center transition-all"
                style={{ width: `${trainPct}%` }}
              >
                Train ({trainPct}%)
              </div>
              <div 
                className="bg-[#A294F9] text-white flex items-center justify-center transition-all"
                style={{ width: `${100 - trainPct}%` }}
              >
                Hidden Test ({100 - trainPct}%)
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8E83A3]">
              <span>Earlier History: Model Fitting</span>
              <span>Latest History: Backtesting Holdout</span>
            </div>

            <button
              onClick={handleSplitConfig}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#A294F9] text-white text-xs font-bold hover:bg-[#9181f7] shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Apply Chronological Split</span>
            </button>

            {splitSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{splitSuccessMsg}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#F5EFFF] flex items-center justify-between">
            <span className="text-xs text-[#5F5670]">Ready to backtest 5 candidate models?</span>
            <button
              onClick={() => onNavigate('comparison')}
              className="text-xs font-bold text-[#A294F9] hover:underline"
            >
              Go to Model Benchmark →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
