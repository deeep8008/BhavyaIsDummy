import React from 'react';
import { 
  CheckCircle2, 
  RotateCw, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Scissors
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

export default function EvaluationPage({ onNavigate }) {
  const { 
    datasetSummary, 
    splitMetadata, 
    benchmarkResults, 
    selectedModel,
    activeDatasetId 
  } = useDataset();

  const splitInfo = benchmarkResults?.split_info || splitMetadata;
  const bestModel = benchmarkResults?.leaderboard?.[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
          Methodological Integrity (Phase 3)
        </div>
        <h1 className="text-3xl font-bold font-heading text-[#1F1B2C]">
          Evaluation & Backtesting Standards
        </h1>
        <p className="text-sm text-[#5F5670] mt-1 max-w-2xl">
          Understanding our chronological out-of-sample backtesting methodology, zero data-leakage boundaries, and robust metric calculations.
        </p>
      </div>

      {/* Metric Explanations */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metric 1: Safe MAPE */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F5EFFF] text-[#A294F9] font-bold text-xs flex items-center justify-center border border-[#CDC1FF]">
                %
              </span>
              <h2 className="text-lg font-bold font-heading text-[#1F1B2C]">
                Zero-Target Safe MAPE
              </h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              Primary Leaderboard Metric
            </span>
          </div>

          <p className="text-xs text-[#5F5670] leading-relaxed">
            <strong>What it tells a planner:</strong> "On average, by what percentage did our predicted demand deviate from actual sales?"
          </p>

          <div className="p-3.5 rounded-2xl bg-[#F5EFFF]/70 border border-[#E5D9F2] text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Mathematical Formula:</span>
              <span className="font-mono text-[#1F1B2C] text-[11px]">MAPE = (100 / N) * Σ |(y - ŷ) / y|</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Zero-Division Safety:</span>
              <span className="font-semibold text-emerald-700">Zero actuals masked (actual != 0); if actual=0 and pred=0, error is 0%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Top Model Achieved:</span>
              <span className="font-bold text-[#A294F9]">
                {bestModel ? `${bestModel.mape.toFixed(2)}% (${bestModel.model_name})` : 'Run Benchmark'}
              </span>
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
                Root Mean Squared Error (RMSE)
              </h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E5D9F2] text-[#A294F9] font-semibold">
              Secondary Tie-Breaker
            </span>
          </div>

          <p className="text-xs text-[#5F5670] leading-relaxed">
            <strong>What it tells a planner:</strong> "In absolute units of inventory, how far off are predictions, giving exponential weight to extreme misforecasts?"
          </p>

          <div className="p-3.5 rounded-2xl bg-[#F5EFFF]/70 border border-[#E5D9F2] text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Mathematical Formula:</span>
              <span className="font-mono text-[#1F1B2C] text-[11px]">RMSE = sqrt( (1 / N) * Σ (y - ŷ)² )</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Unit of Measure:</span>
              <span className="font-semibold text-[#1F1B2C]">Cases / Product Units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F5670]">Top Model RMSE:</span>
              <span className="font-bold text-[#1F1B2C]">
                {bestModel ? `${bestModel.rmse.toFixed(2)} units` : 'Run Benchmark'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: Strict Chronological Split */}
      <section className="p-6 lg:p-8 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
            Section C
          </div>
          <h2 className="text-xl font-bold font-heading text-[#1F1B2C]">
            Chronological Validation (Zero Data Leakage Guarantee)
          </h2>
          <p className="text-xs text-[#5F5670]">
            Time-series data cannot be randomly shuffled or cross-validated with standard k-fold. The test window is strictly after the training window in time (chronological order preserved).
          </p>
        </div>

        {/* Visual Walkthrough Diagram */}
        <div className="p-5 rounded-2xl bg-[#F5EFFF]/50 border border-[#E5D9F2] space-y-4">
          <div className="text-xs font-semibold text-[#1F1B2C] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-[#A294F9]" />
              <span>Current Split Boundary Parameters</span>
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white text-[#A294F9] border border-[#CDC1FF] font-bold">
              Dataset: {activeDatasetId}
            </span>
          </div>

          {/* Active Split Metadata Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E5D9F2]">
              <div className="text-[#8E83A3] text-[10px] font-bold uppercase">Train Observations</div>
              <div className="font-bold text-base text-[#1F1B2C] mt-0.5">
                {splitInfo?.train_observations ? splitInfo.train_observations.toLocaleString() : '80%'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E5D9F2]">
              <div className="text-[#8E83A3] text-[10px] font-bold uppercase">Hidden Test Observations</div>
              <div className="font-bold text-base text-[#A294F9] mt-0.5">
                {splitInfo?.test_observations ? splitInfo.test_observations.toLocaleString() : '20%'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E5D9F2]">
              <div className="text-[#8E83A3] text-[10px] font-bold uppercase">Training Time Window</div>
              <div className="font-bold text-xs text-[#1F1B2C] mt-1 truncate">
                {splitInfo?.train_window ? `${splitInfo.train_window.start} → ${splitInfo.train_window.end}` : 'First 80% History'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E5D9F2]">
              <div className="text-[#8E83A3] text-[10px] font-bold uppercase">Hidden Test Window</div>
              <div className="font-bold text-xs text-emerald-600 mt-1 truncate">
                {splitInfo?.test_window ? `${splitInfo.test_window.start} → ${splitInfo.test_window.end}` : 'Latest 20% Holdout'}
              </div>
            </div>
          </div>

          {/* Visual bar split */}
          <div className="w-full flex h-6 rounded-xl overflow-hidden border border-[#CDC1FF] text-[10px] font-bold">
            <div className="bg-[#E5D9F2] text-[#5F5670] flex items-center justify-center w-[80%]">
              Model Training Period (80%)
            </div>
            <div className="bg-[#A294F9] text-white flex items-center justify-center w-[20%]">
              Hidden Test Holdout (20%)
            </div>
          </div>

          <div className="text-[11px] text-[#8E83A3] pt-1">
            * Strict rule: Target values in the test window are never passed to <code className="text-[#A294F9]">model.fit()</code> during benchmark evaluation.
          </div>
        </div>
      </section>

      {/* Direct Nav to Benchmark */}
      <section className="p-6 rounded-2xl bg-white border border-[#E5D9F2] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-base text-[#1F1B2C]">
            Ready to view the live benchmark results?
          </div>
          <div className="text-xs text-[#5F5670]">
            Review dynamic rankings and inspect model predictions overlaid against actuals.
          </div>
        </div>
        <button
          onClick={() => onNavigate ? onNavigate('comparison') : null}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A294F9] text-white text-xs font-semibold hover:bg-[#9181f7] shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <span>View Model Leaderboard →</span>
        </button>
      </section>
    </div>
  );
}
