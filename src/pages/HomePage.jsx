import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Target, 
  TrendingUp, 
  RotateCcw,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const highlights = [
    {
      title: 'Generic Time-Series Architecture',
      subtitle: 'Not Hardcoded Around Any Single Dataset',
      desc: 'Upload any single-CSV or multi-file directory. Standardizes raw data into a Canonical Schema with automated frequency regularization and missing timestamp imputation.',
      icon: Database,
      badge: 'Universal Ingestion'
    },
    {
      title: 'Strict Chronological 80/20 Backtesting',
      subtitle: 'Guaranteed 0% Lookahead Data Leakage',
      desc: 'Models are trained strictly on the earlier 80% of historical observations and predict the untouched 20% hidden holdout window. Actual holdout values are never leaked during training.',
      icon: Lock,
      badge: 'Zero Data Leakage'
    },
    {
      title: 'Unified 5-Model Engine',
      subtitle: 'Statistical, ML & Deep Attention',
      desc: 'Direct head-to-head backtesting across ARIMA/SARIMA, Prophet, LightGBM, DeepAR (RNN), and Temporal Fusion Transformer (TFT) under the exact same BaseForecaster interface.',
      icon: Cpu,
      badge: '5 Candidate Models'
    },
    {
      title: 'Dynamic Leaderboard Ranking',
      subtitle: 'Objective Out-of-Sample Metrics',
      desc: 'Models are dynamically ranked by out-of-sample MAPE (Mean Absolute Percentage Error) with RMSE (Root Mean Squared Error) as tie-breaker. Lower error always ranks higher.',
      icon: Target,
      badge: 'Objective Evaluation'
    },
    {
      title: '100% Historical Retraining',
      subtitle: 'Maximum Recency Before Future Forecasting',
      desc: 'Once the top model is selected, ForecastIQ retrains the architecture on 100% of available historical observations before projecting into the unknown future horizon.',
      icon: RotateCcw,
      badge: '100% Retraining'
    },
    {
      title: 'Actionable Business Decision Support',
      subtitle: 'Uncertainty Bounds & Safety Stock',
      desc: 'Generates monotonic 80% and 95% confidence intervals, projected demand trends, and recommended safety stock buffers based on lead-time uncertainty scaling.',
      icon: TrendingUp,
      badge: 'Decision Support'
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-[#E5D9F2] p-8 lg:p-12 shadow-xs">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-br from-[#F5EFFF] via-[#E5D9F2]/50 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5EFFF] border border-[#CDC1FF] text-xs font-bold uppercase tracking-wider text-[#A294F9]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise Multi-Horizon Demand Planning</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-[#1F1B2C] tracking-tight leading-tight">
            Welcome to <span className="text-[#A294F9]">ForecastIQ</span>
          </h1>

          <p className="text-base sm:text-lg text-[#5F5670] leading-relaxed">
            The modern demand forecasting platform built on rigorous machine learning standards. Upload any time-series dataset, backtest 5 candidate models on hidden holdout sales, and generate future forecasts retrained on 100% historical data.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('forecast')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#A294F9] text-white font-bold text-sm hover:bg-[#9181f7] shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <span>Go to Generate Forecast</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs text-[#5F5670] font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Mock Data • Real ML Models</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why ForecastIQ is Best & Unique */}
      <section className="space-y-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
            Engine Advantages
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1F1B2C]">
            Why ForecastIQ is Best & Unique
          </h2>
          <p className="text-sm text-[#5F5670] mt-1 max-w-2xl">
            Designed to eliminate the common pitfalls of naive time-series tools: data leakage, hardcoded datasets, and black-box guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-3 hover:border-[#CDC1FF] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-[#F5EFFF] text-[#A294F9] border border-[#CDC1FF] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F5EFFF] text-[#A294F9] border border-[#CDC1FF]">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#1F1B2C]">
                      {item.title}
                    </h3>
                    <div className="text-xs text-[#A294F9] font-semibold mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>

                  <p className="text-xs text-[#5F5670] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 10-Step Workflow Banner */}
      <section className="p-8 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
            Rigor By Design
          </div>
          <h3 className="text-xl font-bold font-heading text-[#1F1B2C]">
            The 10-Step Evaluation & Forecasting Process
          </h3>
          <p className="text-xs text-[#5F5670]">
            How ForecastIQ objectively evaluates and projects your demand:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F5EFFF] border border-[#E5D9F2] space-y-1">
            <span className="font-bold text-[#A294F9]">Step 1–2</span>
            <div className="font-semibold text-[#1F1B2C]">Upload & Chronological Split</div>
            <p className="text-[11px] text-[#5F5670]">Take first 80 days as training; hide remaining 20 days.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F5EFFF] border border-[#E5D9F2] space-y-1">
            <span className="font-bold text-[#A294F9]">Step 3–4</span>
            <div className="font-semibold text-[#1F1B2C]">Fit on 80D & Predict 20D</div>
            <p className="text-[11px] text-[#5F5670]">Train models on training set; project the hidden 20 days.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F5EFFF] border border-[#E5D9F2] space-y-1">
            <span className="font-bold text-[#A294F9]">Step 5–6</span>
            <div className="font-semibold text-[#1F1B2C]">Compare Actuals & Errors</div>
            <p className="text-[11px] text-[#5F5670]">Calculate real MAPE % and RMSE against actual sales.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F5EFFF] border border-[#E5D9F2] space-y-1">
            <span className="font-bold text-[#A294F9]">Step 7–9</span>
            <div className="font-semibold text-[#1F1B2C]">5-Model Dynamic Ranking</div>
            <p className="text-[11px] text-[#5F5670]">Rank all 5 candidate models on leaderboard (lower is better).</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F5EFFF] border border-[#E5D9F2] space-y-1">
            <span className="font-bold text-[#A294F9]">Step 10</span>
            <div className="font-semibold text-[#1F1B2C]">100% History Retrain & Forecast</div>
            <p className="text-[11px] text-[#5F5670]">Retrain selected model on 100% data and project future horizon.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onNavigate('forecast')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A294F9] text-white text-xs font-bold hover:bg-[#9181f7] shadow-xs cursor-pointer"
          >
            <span>Start with Your Dataset Now →</span>
          </button>
        </div>
      </section>
    </div>
  );
}
