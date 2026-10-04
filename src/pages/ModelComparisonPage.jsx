import React, { useState } from 'react';
import { 
  BarChart2, 
  Filter, 
  HelpCircle, 
  TrendingUp, 
  Info, 
  ChevronRight,
  ShieldAlert,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { 
  BENCHMARK_METRICS, 
  STORES, 
  CATEGORIES, 
  PRODUCTS 
} from '../data/mockData';

export default function ModelComparisonPage({ onNavigate }) {
  const [filterHorizon, setFilterHorizon] = useState('all'); // all, 7d, 28d, 90d
  const [filterStore, setFilterStore] = useState('CA_1');
  const [filterCategory, setFilterCategory] = useState('FOODS');
  const [activeMetricTab, setActiveMetricTab] = useState('mape'); // 'mape' or 'rmse'

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
          Multi-Model Benchmarks
        </div>
        <h1 className="text-3xl font-bold font-heading text-[#1F1B2C]">
          Model Comparison
        </h1>
        <p className="text-sm text-[#5F5670] mt-1 max-w-2xl">
          Objective evaluation of statistical baselines, tree-based machine learning, and deep neural multi-horizon architectures across short-, medium-, and long-term horizons.
        </p>
      </div>

      {/* Filter Toolbar */}
      <section className="p-5 rounded-2xl bg-white border border-[#E5D9F2] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
          {/* Horizon filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              Filter Horizon
            </label>
            <select
              value={filterHorizon}
              onChange={(e) => setFilterHorizon(e.target.value)}
              className="w-full bg-[#F5EFFF] border border-[#CDC1FF] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1B2C] outline-none"
            >
              <option value="all">All Horizons (7D, 28D, 90D)</option>
              <option value="7d">7 Days (Short-term)</option>
              <option value="28d">28 Days (Medium-term)</option>
              <option value="90d">90 Days (Long-term)</option>
            </select>
          </div>

          {/* Store filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              Store Slice
            </label>
            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="w-full bg-[#F5EFFF] border border-[#CDC1FF] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1B2C] outline-none"
            >
              {STORES.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              Product Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-[#F5EFFF] border border-[#CDC1FF] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1B2C] outline-none"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Metric switch */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              Comparison Metric
            </label>
            <div className="grid grid-cols-2 gap-1 bg-[#F5EFFF] p-1 rounded-xl border border-[#CDC1FF]">
              <button
                onClick={() => setActiveMetricTab('mape')}
                className={`py-1.5 text-center text-xs rounded-lg font-medium transition-all ${
                  activeMetricTab === 'mape' 
                    ? 'bg-[#A294F9] text-white font-bold shadow-xs' 
                    : 'text-[#5F5670] hover:text-[#1F1B2C]'
                }`}
              >
                MAPE (%)
              </button>
              <button
                onClick={() => setActiveMetricTab('rmse')}
                className={`py-1.5 text-center text-xs rounded-lg font-medium transition-all ${
                  activeMetricTab === 'rmse' 
                    ? 'bg-[#A294F9] text-white font-bold shadow-xs' 
                    : 'text-[#5F5670] hover:text-[#1F1B2C]'
                }`}
              >
                RMSE (Units)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Table 1: MAPE Comparison */}
      <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Metric Table 1
            </div>
            <h2 className="text-xl font-bold font-heading text-[#1F1B2C]">
              MAPE Performance Across Horizons (Mean Absolute % Error)
            </h2>
            <p className="text-xs text-[#5F5670]">
              Lower is better. Demonstrates error growth rate as forecast horizon widens.
            </p>
          </div>
          <span className="text-xs text-[#5F5670] bg-[#F5EFFF] px-3 py-1.5 rounded-xl border border-[#E5D9F2]">
            Evidence-based cross-validation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5D9F2] text-[#8E83A3] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Model Architecture</th>
                <th className="py-3 px-4 font-semibold">Class</th>
                <th className={`py-3 px-4 font-semibold ${filterHorizon === '7d' ? 'bg-[#F5EFFF] text-[#1F1B2C]' : ''}`}>
                  7D MAPE (Short)
                </th>
                <th className={`py-3 px-4 font-semibold ${filterHorizon === '28d' ? 'bg-[#F5EFFF] text-[#1F1B2C]' : ''}`}>
                  28D MAPE (Med)
                </th>
                <th className={`py-3 px-4 font-semibold ${filterHorizon === '90d' ? 'bg-[#F5EFFF] text-[#1F1B2C]' : ''}`}>
                  90D MAPE (Long)
                </th>
                <th className="py-3 px-4 font-semibold">Horizon Consistency</th>
                <th className="py-3 px-4 font-semibold">Inference Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFFF]">
              {BENCHMARK_METRICS.map((row) => (
                <tr key={row.modelId} className="hover:bg-[#F5EFFF]/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1F1B2C]">
                    {row.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#5F5670]">
                    {row.type}
                  </td>
                  <td className={`py-3.5 px-4 font-semibold text-[#1F1B2C] ${filterHorizon === '7d' ? 'bg-[#F5EFFF]' : ''}`}>
                    {row.mape7}%
                  </td>
                  <td className={`py-3.5 px-4 font-semibold text-[#1F1B2C] ${filterHorizon === '28d' ? 'bg-[#F5EFFF]' : ''}`}>
                    {row.mape28}%
                  </td>
                  <td className={`py-3.5 px-4 font-semibold text-[#1F1B2C] ${filterHorizon === '90d' ? 'bg-[#F5EFFF]' : ''}`}>
                    {row.mape90}%
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      row.stability === 'Exceptional' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : row.stability === 'Very High' 
                          ? 'bg-[#E5D9F2] text-[#A294F9]' 
                          : 'bg-gray-100 text-[#5F5670]'
                    }`}>
                      {row.stability}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#8E83A3] font-mono">
                    {row.inferenceSpeed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Main Table 2: RMSE Comparison */}
      <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Metric Table 2
            </div>
            <h2 className="text-xl font-bold font-heading text-[#1F1B2C]">
              RMSE Magnitude Across Horizons (Root Mean Squared Error)
            </h2>
            <p className="text-xs text-[#5F5670]">
              Units of daily demand. Heavily penalizes large unpredicted stockout or overstock spikes.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5D9F2] text-[#8E83A3] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Model Architecture</th>
                <th className="py-3 px-4 font-semibold">Class</th>
                <th className={`py-3 px-4 font-semibold ${filterHorizon === '7d' ? 'bg-[#F5EFFF] text-[#1F1B2C]' : ''}`}>
                  7D RMSE
                </th>
                <th className={`py-3 px-4 font-semibold ${filterHorizon === '28d' ? 'bg-[#F5EFFF] text-[#1F1B2C]' : ''}`}>
                  28D RMSE
                </th>
                <th className={`py-3 px-4 font-semibold ${filterHorizon === '90d' ? 'bg-[#F5EFFF] text-[#1F1B2C]' : ''}`}>
                  90D RMSE
                </th>
                <th className="py-3 px-4 font-semibold">Large Error Penalty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFFF]">
              {BENCHMARK_METRICS.map((row) => (
                <tr key={row.modelId} className="hover:bg-[#F5EFFF]/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1F1B2C]">
                    {row.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#5F5670]">
                    {row.type}
                  </td>
                  <td className={`py-3.5 px-4 font-semibold text-[#1F1B2C] ${filterHorizon === '7d' ? 'bg-[#F5EFFF]' : ''}`}>
                    {row.rmse7}
                  </td>
                  <td className={`py-3.5 px-4 font-semibold text-[#1F1B2C] ${filterHorizon === '28d' ? 'bg-[#F5EFFF]' : ''}`}>
                    {row.rmse28}
                  </td>
                  <td className={`py-3.5 px-4 font-semibold text-[#1F1B2C] ${filterHorizon === '90d' ? 'bg-[#F5EFFF]' : ''}`}>
                    {row.rmse90}
                  </td>
                  <td className="py-3.5 px-4 text-[#5F5670]">
                    {row.rmse90 > 18 ? 'High tail error on 90D' : 'Controlled tail error'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Visualizations Section: 1. MAPE by Model, 2. RMSE by Model, 3. Horizon Consistency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual 1: Error Across Horizons Bar Chart */}
        <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Visual Comparison
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
              {activeMetricTab === 'mape' ? 'MAPE Error Comparison' : 'RMSE Error Comparison'}
            </h3>
            <p className="text-xs text-[#5F5670]">
              Bar grouping across 7D (short), 28D (medium), and 90D (long) horizons.
            </p>
          </div>

          {/* SVG Grouped Bar Chart */}
          <div className="relative w-full h-64 bg-[#F5EFFF]/30 rounded-2xl border border-[#E5D9F2] p-4 flex flex-col justify-end">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {/* Baseline lines */}
              {[0, 5, 10, 15, 20, 25].map(v => (
                <g key={v}>
                  <line x1="40" y1={160 - (v / 25) * 140} x2="480" y2={160 - (v / 25) * 140} stroke="#E5D9F2" strokeDasharray="3 3" />
                  <text x="30" y={164 - (v / 25) * 140} textAnchor="end" className="text-[9px] fill-[#8E83A3] font-medium">{v}</text>
                </g>
              ))}

              {/* Bars per model */}
              {BENCHMARK_METRICS.map((m, i) => {
                const groupX = 65 + i * 85;
                const v7 = activeMetricTab === 'mape' ? m.mape7 : m.rmse7;
                const v28 = activeMetricTab === 'mape' ? m.mape28 : m.rmse28;
                const v90 = activeMetricTab === 'mape' ? m.mape90 : m.rmse90;

                const h7 = (v7 / 25) * 140;
                const h28 = (v28 / 25) * 140;
                const h90 = (v90 / 25) * 140;

                return (
                  <g key={m.modelId}>
                    {/* 7D Bar */}
                    <rect x={groupX} y={160 - h7} width="16" height={h7} fill="#CDC1FF" rx="3" />
                    {/* 28D Bar */}
                    <rect x={groupX + 18} y={160 - h28} width="16" height={h28} fill="#A294F9" rx="3" />
                    {/* 90D Bar */}
                    <rect x={groupX + 36} y={160 - h90} width="16" height={h90} fill="#5F5670" rx="3" />

                    {/* Model label */}
                    <text x={groupX + 26} y="175" textAnchor="middle" className="text-[9px] fill-[#1F1B2C] font-semibold">
                      {m.modelId.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-[11px] text-[#5F5670] mt-3 pt-2 border-t border-[#E5D9F2]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#CDC1FF] rounded-xs inline-block"></span>
                7 Days (Short)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#A294F9] rounded-xs inline-block"></span>
                28 Days (Medium)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#5F5670] rounded-xs inline-block"></span>
                90 Days (Long)
              </span>
            </div>
          </div>
        </section>

        {/* Visual 2: Horizon Consistency Radar / Trajectory */}
        <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Degradation Curve
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
              Horizon Consistency Analysis
            </h3>
            <p className="text-xs text-[#5F5670]">
              How error scales from 7D to 90D: steeper slopes denote rapid accuracy decay.
            </p>
          </div>

          <div className="relative w-full h-64 bg-[#F5EFFF]/30 rounded-2xl border border-[#E5D9F2] p-4 flex flex-col justify-end">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {/* Vertical horizon guidelines */}
              <line x1="80" y1="20" x2="80" y2="150" stroke="#E5D9F2" strokeDasharray="3 3" />
              <line x1="250" y1="20" x2="250" y2="150" stroke="#E5D9F2" strokeDasharray="3 3" />
              <line x1="420" y1="20" x2="420" y2="150" stroke="#E5D9F2" strokeDasharray="3 3" />

              <text x="80" y="168" textAnchor="middle" className="text-[10px] font-bold fill-[#1F1B2C]">7 Days</text>
              <text x="250" y="168" textAnchor="middle" className="text-[10px] font-bold fill-[#1F1B2C]">28 Days</text>
              <text x="420" y="168" textAnchor="middle" className="text-[10px] font-bold fill-[#1F1B2C]">90 Days</text>

              {/* Slopes for each model */}
              {BENCHMARK_METRICS.map((m) => {
                const y1 = 150 - (m.mape7 / 25) * 130;
                const y2 = 150 - (m.mape28 / 25) * 130;
                const y3 = 150 - (m.mape90 / 25) * 130;
                const isTFT = m.modelId === 'tft';
                const isArima = m.modelId === 'arima';
                const color = isTFT ? '#A294F9' : isArima ? '#E11D48' : '#8E83A3';

                return (
                  <g key={m.modelId}>
                    <path
                      d={`M 80 ${y1} L 250 ${y2} L 420 ${y3}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={isTFT ? '3' : '1.5'}
                      strokeDasharray={isArima ? '4 2' : 'none'}
                    />
                    <circle cx="80" cy={y1} r={isTFT ? 4 : 3} fill={color} />
                    <circle cx="250" cy={y2} r={isTFT ? 4 : 3} fill={color} />
                    <circle cx="420" cy={y3} r={isTFT ? 4 : 3} fill={color} />
                    <text x="428" y={y3 + 3} className="text-[9px] font-semibold" fill={color}>
                      {m.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="text-[11px] text-[#5F5670] mt-3 pt-2 border-t border-[#E5D9F2] flex items-center justify-between">
              <span>Stable Multi-Horizon Flatness: <strong className="text-[#A294F9]">TFT & DeepAR</strong></span>
              <span>Fastest Baseline Computation: <strong className="text-[#1F1B2C]">ARIMA & LightGBM</strong></span>
            </div>
          </div>
        </section>
      </div>

      {/* Unbiased Evidence-Based Interpretation Card */}
      <section className="p-6 rounded-2xl bg-white border border-[#E5D9F2] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1F1B2C]">
          <Info className="w-4 h-4 text-[#A294F9]" />
          <span>Objective Interpretation Framework</span>
        </div>
        <p className="text-xs text-[#5F5670] leading-relaxed">
          Rather than declaring a single universal model "best", enterprise demand planning involves distinct operational trade-offs:
          <strong> ARIMA/SARIMA</strong> offers instantaneous computation and clear statistical transparency for stable items; 
          <strong> LightGBM</strong> offers exceptional tabular throughput with rich lag features; and 
          <strong> Temporal Fusion Transformer (TFT)</strong> demonstrates superior multi-step horizon consistency for complex seasonal patterns with external price and holiday covariates.
        </p>
      </section>
    </div>
  );
}
