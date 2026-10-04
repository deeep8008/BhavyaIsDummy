import React, { useState } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  RotateCw, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { BACKTESTING_FOLDS, BENCHMARK_METRICS } from '../data/mockData';

export default function EvaluationPage() {
  const [activeMetricDetail, setActiveMetricDetail] = useState('mape');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
          Methodological Rigor
        </div>
        <h1 className="text-3xl font-bold font-heading text-[#1F1B2C]">
          Evaluation & Backtesting
        </h1>
        <p className="text-sm text-[#5F5670] mt-1 max-w-2xl">
          Understanding model accuracy, temporal out-of-sample backtesting, and performance degradation across 7-day, 28-day, and 90-day forecasting windows.
        </p>
      </div>

      {/* Human-Friendly Metric Explanations (No math jargon) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metric 1: MAPE */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F5EFFF] text-[#A294F9] font-bold text-xs flex items-center justify-center border border-[#CDC1FF]">
                %
              </span>
              <h2 className="text-lg font-bold font-heading text-[#1F1B2C]">
                MAPE (Mean Absolute Percentage Error)
              </h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              Relative Metric
            </span>
          </div>

          <p className="text-xs text-[#5F5670] leading-relaxed">
            <strong>What it tells a planner:</strong> "On average, by what percentage did our predicted demand deviate from the actual units sold?"
          </p>

          <div className="p-3.5 rounded-2xl bg-[#F5EFFF]/70 border border-[#E5D9F2] text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Typical M5 Retail Target:</span>
              <span className="font-semibold text-[#1F1B2C]">&lt; 15% Error</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Best Short-term (7D) Achieved:</span>
              <span className="font-semibold text-[#A294F9]">8.7% (TFT Architecture)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Key Advantage:</span>
              <span className="font-medium text-[#1F1B2C]">Scale-independent; easy to explain to executive leadership.</span>
            </div>
          </div>
        </div>

        {/* Metric 2: RMSE */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F5EFFF] text-[#A294F9] font-bold text-xs flex items-center justify-center border border-[#CDC1FF]">
                #
              </span>
              <h2 className="text-lg font-bold font-heading text-[#1F1B2C]">
                RMSE (Root Mean Squared Error)
              </h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E5D9F2] text-[#A294F9] font-semibold">
              Magnitude Metric
            </span>
          </div>

          <p className="text-xs text-[#5F5670] leading-relaxed">
            <strong>What it tells a planner:</strong> "In absolute product units, how far off are predictions, giving extra weight to large surprising misforecasts?"
          </p>

          <div className="p-3.5 rounded-2xl bg-[#F5EFFF]/70 border border-[#E5D9F2] text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Unit Measurement:</span>
              <span className="font-semibold text-[#1F1B2C]">Cases / Pieces Sold</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Best Short-term (7D) Achieved:</span>
              <span className="font-semibold text-[#A294F9]">7.9 Units (TFT)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Key Advantage:</span>
              <span className="font-medium text-[#1F1B2C]">Heavily penalizes massive stockouts and costly overstocks.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: Backtesting Rolling Window Workflow */}
      <section className="p-6 lg:p-8 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
            Section C
          </div>
          <h2 className="text-xl font-bold font-heading text-[#1F1B2C]">
            Walk-Forward Rolling Window Backtesting
          </h2>
          <p className="text-xs text-[#5F5670]">
            Time-series data cannot be shuffled randomly. We simulate real enterprise operational conditions using chronological sliding windows across multiple historical folds.
          </p>
        </div>

        {/* Visual Walkthrough Diagram */}
        <div className="p-5 rounded-2xl bg-[#F5EFFF]/50 border border-[#E5D9F2] space-y-4">
          <div className="text-xs font-semibold text-[#1F1B2C] flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-[#A294F9]" />
            <span>Chronological Validation Strategy</span>
          </div>

          {/* Fold Steps Visual */}
          <div className="space-y-3">
            {[
              { fold: 'Fold 1', trainPct: '70%', testPct: '10%', trainDays: 'Days 1–1773', testDays: 'Days 1774–1801 (28D)' },
              { fold: 'Fold 2', trainPct: '75%', testPct: '10%', trainDays: 'Days 1–1801', testDays: 'Days 1802–1829 (28D)' },
              { fold: 'Fold 3', trainPct: '80%', testPct: '10%', trainDays: 'Days 1–1829', testDays: 'Days 1830–1857 (28D)' },
              { fold: 'Fold 4 (Current)', trainPct: '85%', testPct: '15%', trainDays: 'Days 1–1885', testDays: 'Days 1886–1913 (28D Test)' }
            ].map((f, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-white border border-[#E5D9F2] text-xs">
                <div className="w-28 font-bold text-[#1F1B2C] shrink-0">{f.fold}</div>
                
                {/* Visual bar split */}
                <div className="w-full flex h-5 rounded-lg overflow-hidden border border-[#CDC1FF]">
                  <div 
                    className="bg-[#E5D9F2] flex items-center justify-center text-[10px] text-[#5F5670] font-medium"
                    style={{ width: f.trainPct }}
                  >
                    Historical Training ({f.trainDays})
                  </div>
                  <div 
                    className="bg-[#A294F9] flex items-center justify-center text-[10px] text-white font-bold"
                    style={{ width: f.testPct }}
                  >
                    Test ({f.testDays})
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-[#8E83A3] pt-1">
            * This methodology guarantees zero data leakage: models never observe future calendar, holiday, or price events during training.
          </div>
        </div>

        {/* Backtesting Folds Result Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5D9F2] text-[#8E83A3] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Validation Window</th>
                <th className="py-3 px-4 font-semibold">Training Range</th>
                <th className="py-3 px-4 font-semibold">Unseen Test Duration</th>
                <th className="py-3 px-4 font-semibold">Top Performing Architecture</th>
                <th className="py-3 px-4 font-semibold">Window MAPE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFFF]">
              {BACKTESTING_FOLDS.map((f, i) => (
                <tr key={i} className="hover:bg-[#F5EFFF]/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#1F1B2C]">{f.fold}</td>
                  <td className="py-3 px-4 text-[#5F5670]">{f.trainPeriod}</td>
                  <td className="py-3 px-4 text-[#1F1B2C]">{f.testDays} Days Out-of-Sample</td>
                  <td className="py-3 px-4 font-semibold text-[#A294F9]">{f.bestModel}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">{f.avgMape}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section D: Horizon Consistency Check */}
      <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
            Section D
          </div>
          <h2 className="text-xl font-bold font-heading text-[#1F1B2C]">
            Horizon Consistency Matrix (Short vs Medium vs Long)
          </h2>
          <p className="text-xs text-[#5F5670]">
            Comparing how each model degrades as predictions step further into the future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-[#F5EFFF] border border-[#CDC1FF] space-y-2">
            <span className="text-xs font-bold text-[#A294F9] uppercase tracking-wider">
              Short Horizon (7 Days)
            </span>
            <div className="text-sm font-semibold text-[#1F1B2C]">
              Operational Day-to-Day Stability
            </div>
            <p className="text-xs text-[#5F5670] leading-relaxed">
              Tree-based models (LightGBM) and deep attention (TFT) lead with &lt; 10.5% MAPE. Immediate lags from t-1 and t-7 provide exceptional predictive certainty.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5EFFF] border border-[#CDC1FF] space-y-2">
            <span className="text-xs font-bold text-[#A294F9] uppercase tracking-wider">
              Medium Horizon (28 Days)
            </span>
            <div className="text-sm font-semibold text-[#1F1B2C]">
              Tactical Monthly Planning
            </div>
            <p className="text-xs text-[#5F5670] leading-relaxed">
              Prophet and TFT remain resilient by capturing recurring monthly payday and SNAP benefits. Autoregressive statistical models (ARIMA) begin accumulating recursive drift.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5EFFF] border border-[#CDC1FF] space-y-2">
            <span className="text-xs font-bold text-[#A294F9] uppercase tracking-wider">
              Long Horizon (90 Days)
            </span>
            <div className="text-sm font-semibold text-[#1F1B2C]">
              Strategic Quarterly Outlook
            </div>
            <p className="text-xs text-[#5F5670] leading-relaxed">
              Only multi-horizon deep architectures (TFT & DeepAR) maintain error below 14% MAPE due to specialized gating mechanisms that prevent multi-step error accumulation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
