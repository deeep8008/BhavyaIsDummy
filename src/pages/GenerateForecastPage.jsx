import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Cpu, 
  Store, 
  RotateCcw, 
  BarChart2, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import ForecastChart from '../components/ForecastChart';
import { 
  STORES, 
  PRODUCTS, 
  MODELS, 
  HORIZONS, 
  generateTimeSeries 
} from '../data/mockData';

export default function GenerateForecastPage({ onNavigate }) {
  const [storeId, setStoreId] = useState('CA_1');
  const [productId, setProductId] = useState('FOODS_3_090');
  const [horizonDays, setHorizonDays] = useState(28);
  const [modelId, setModelId] = useState('tft');

  // Generation execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0); // 0 to 4
  const [forecastResult, setForecastResult] = useState(null);

  const stepsList = [
    'Preparing data from M5 product-store series...',
    'Preparing forecasting features (lags, rolling stats, calendar & price)...',
    'Generating multi-horizon predictions with selected architecture...',
    'Preparing results and confidence intervals...'
  ];

  const handleStartForecast = () => {
    setIsGenerating(true);
    setGenerationStep(0);
    setForecastResult(null);

    // Sequential clean progress without fake percentages
    setTimeout(() => {
      setGenerationStep(1);
      setTimeout(() => {
        setGenerationStep(2);
        setTimeout(() => {
          setGenerationStep(3);
          setTimeout(() => {
            const result = generateTimeSeries(storeId, productId, modelId, horizonDays);
            setForecastResult(result);
            setIsGenerating(false);
          }, 450);
        }, 500);
      }, 500);
    }, 450);
  };

  // Horizon switching in the result view without restarting the flow
  const handleHorizonSwitch = (newDays) => {
    setHorizonDays(newDays);
    const updated = generateTimeSeries(storeId, productId, modelId, newDays);
    setForecastResult(updated);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
          Inference Engine
        </div>
        <h1 className="text-3xl font-bold font-heading text-[#1F1B2C]">
          Generate a Forecast
        </h1>
        <p className="text-sm text-[#5F5670] mt-1 max-w-2xl">
          Choose what you want to forecast across store tiers, products, multi-step planning horizons, and model architectures.
        </p>
      </div>

      {/* Main Configuration Steps Container */}
      {!forecastResult && !isGenerating && (
        <div className="space-y-6">
          <div className="p-6 lg:p-8 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-8">
            {/* Step 1 & Step 2 Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1: Select Store */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#A294F9] text-white text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <label className="text-sm font-bold font-heading text-[#1F1B2C]">
                    Select Store
                  </label>
                </div>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full bg-[#F5EFFF] border border-[#CDC1FF] rounded-2xl px-4 py-3 text-sm font-semibold text-[#1F1B2C] outline-none hover:border-[#A294F9] transition-colors"
                >
                  {STORES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-[#8E83A3]">
                  Selected store feeds historical velocity and state calendar holiday mappings.
                </div>
              </div>

              {/* Step 2: Select Product */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#A294F9] text-white text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <label className="text-sm font-bold font-heading text-[#1F1B2C]">
                    Select Product / Category
                  </label>
                </div>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-[#F5EFFF] border border-[#CDC1FF] rounded-2xl px-4 py-3 text-sm font-semibold text-[#1F1B2C] outline-none hover:border-[#A294F9] transition-colors"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.id} — {p.name}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-[#8E83A3]">
                  Search across Food staples, Hobbies, or Household consumables.
                </div>
              </div>
            </div>

            {/* Step 3: Select Forecast Horizon */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#A294F9] text-white text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
                <label className="text-sm font-bold font-heading text-[#1F1B2C]">
                  Select Forecast Horizon
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HORIZONS.map((h) => {
                  const isSelected = horizonDays === h.days;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setHorizonDays(h.days)}
                      className={`
                        p-5 rounded-2xl border cursor-pointer transition-all relative
                        ${isSelected 
                          ? 'bg-[#F5EFFF] border-[#A294F9] shadow-sm ring-1 ring-[#A294F9]' 
                          : 'bg-white border-[#E5D9F2] hover:border-[#CDC1FF]'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#A294F9] text-white' : 'bg-[#E5D9F2]/70 text-[#5F5670]'
                        }`}>
                          {h.term}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#A294F9] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="text-2xl font-extrabold font-heading text-[#1F1B2C] mt-3">
                        {h.label}
                      </div>

                      <p className="text-xs text-[#5F5670] mt-1.5 leading-relaxed">
                        {h.focus}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Select Model */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#A294F9] text-white text-[11px] font-bold flex items-center justify-center">
                  4
                </span>
                <label className="text-sm font-bold font-heading text-[#1F1B2C]">
                  Select Model
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {MODELS.map((m) => {
                  const isSelected = modelId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setModelId(m.id)}
                      className={`
                        p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between
                        ${isSelected 
                          ? 'bg-[#F5EFFF] border-[#A294F9] shadow-sm ring-1 ring-[#A294F9]' 
                          : 'bg-white border-[#E5D9F2] hover:border-[#CDC1FF]'
                        }
                      `}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E83A3]">
                            {m.type}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#A294F9] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-bold font-heading text-[#1F1B2C]">
                          {m.name}
                        </div>

                        <p className="text-[11px] text-[#5F5670] mt-1 line-clamp-2 leading-relaxed">
                          {m.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#E5D9F2]/70 flex items-center justify-between text-[10px] text-[#8E83A3]">
                        <span>{m.framework}</span>
                        <span className="font-semibold text-[#A294F9]">{m.tag}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4 flex items-center justify-end">
              <button
                onClick={handleStartForecast}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#A294F9] text-white font-bold text-sm hover:bg-[#9181f7] shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Forecast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elegant Progress State (No Fake Percentages) */}
      {isGenerating && (
        <div className="p-12 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs text-center max-w-xl mx-auto space-y-6 my-8">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#F5EFFF] border border-[#CDC1FF] flex items-center justify-center text-[#A294F9]">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h3 className="text-xl font-bold font-heading text-[#1F1B2C]">
              Generating Forecast...
            </h3>
            <p className="text-xs text-[#5F5670] mt-1">
              Executing pipeline for {storeId} • {productId} across {horizonDays} days.
            </p>
          </div>

          {/* Sequential Step Badges */}
          <div className="space-y-2.5 text-left max-w-md mx-auto">
            {stepsList.map((stepText, idx) => {
              const isDone = generationStep > idx;
              const isCurrent = generationStep === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${
                    isDone 
                      ? 'bg-[#F5EFFF] border-[#CDC1FF] text-[#1F1B2C] font-medium' 
                      : isCurrent 
                        ? 'bg-white border-[#A294F9] text-[#A294F9] font-bold shadow-xs' 
                        : 'bg-gray-50 border-gray-100 text-[#8E83A3]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    isDone ? 'bg-[#A294F9] text-white' : isCurrent ? 'border-2 border-[#A294F9]' : 'border border-gray-300'
                  }`}>
                    {isDone && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FORECAST RESULTS VIEW (Appears smoothly after generation) */}
      {forecastResult && !isGenerating && (
        <div className="space-y-6">
          {/* Header Summary / Configuration Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E5D9F2] shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#1F1B2C]">Active Run:</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F5EFFF] text-[#1F1B2C] border border-[#CDC1FF] font-medium">
                Store: {forecastResult.store.name}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F5EFFF] text-[#1F1B2C] border border-[#CDC1FF] font-medium">
                Product: {forecastResult.product.id} ({forecastResult.product.name})
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#E5D9F2] text-[#1F1B2C] border border-[#CDC1FF] font-semibold">
                Model: {forecastResult.model.name}
              </span>
            </div>

            <button
              onClick={() => {
                setForecastResult(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F5670] hover:text-[#1F1B2C] px-3 py-1.5 rounded-xl border border-[#E5D9F2] bg-[#F5EFFF] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Modify Selection</span>
            </button>
          </div>

          {/* Top 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E5D9F2] shadow-xs space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3]">
                Forecast Horizon
              </div>
              <div className="text-2xl font-bold font-heading text-[#1F1B2C]">
                {forecastResult.horizonDays} Days
              </div>
              <div className="text-xs text-[#5F5670]">
                {forecastResult.horizonDays === 7 ? 'Short-term daily' : forecastResult.horizonDays === 28 ? 'Medium-term tactical' : 'Long-term strategic'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5D9F2] shadow-xs space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3]">
                Total Forecasted Demand
              </div>
              <div className="text-2xl font-bold font-heading text-[#A294F9]">
                {forecastResult.summary.totalDemand} <span className="text-xs font-normal text-[#5F5670]">units</span>
              </div>
              <div className="text-xs text-[#5F5670]">
                Avg {forecastResult.summary.avgDailyDemand} units/day
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5D9F2] shadow-xs space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3]">
                Backtested MAPE
              </div>
              <div className="text-2xl font-bold font-heading text-emerald-600">
                {forecastResult.mape}%
              </div>
              <div className="text-xs text-[#5F5670]">
                Mean Absolute Percentage Error
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5D9F2] shadow-xs space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3]">
                Backtested RMSE
              </div>
              <div className="text-2xl font-bold font-heading text-[#1F1B2C]">
                {forecastResult.rmse} <span className="text-xs font-normal text-[#5F5670]">units</span>
              </div>
              <div className="text-xs text-[#5F5670]">
                Root Mean Squared Error
              </div>
            </div>
          </div>

          {/* Main Chart Card with Easy Horizon Switching directly above */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-heading text-[#1F1B2C]">
                  Actual vs Forecast
                </h3>
                <p className="text-xs text-[#5F5670]">
                  Seamless horizon switching: switch between 7D, 28D, and 90D horizons below without rerunning.
                </p>
              </div>
            </div>

            {/* Direct Horizon Switching Tabs & Interactive Chart */}
            <ForecastChart
              history={forecastResult.history}
              forecast={forecastResult.forecast}
              todayDate={forecastResult.todayDate}
              horizonDays={forecastResult.horizonDays}
              onHorizonChange={handleHorizonSwitch}
              showHorizonSwitch={true}
              storeName={forecastResult.store.id}
              productName={forecastResult.product.name}
            />

            {/* Forecast Summary Details Grid */}
            <div className="pt-4 border-t border-[#F5EFFF] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F5EFFF]/60 border border-[#E5D9F2]">
                <div className="text-[#8E83A3]">Total Demand</div>
                <div className="font-bold text-sm text-[#1F1B2C] mt-0.5">
                  {forecastResult.summary.totalDemand} units
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5EFFF]/60 border border-[#E5D9F2]">
                <div className="text-[#8E83A3]">Average Daily Demand</div>
                <div className="font-bold text-sm text-[#1F1B2C] mt-0.5">
                  {forecastResult.summary.avgDailyDemand} units / day
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5EFFF]/60 border border-[#E5D9F2]">
                <div className="text-[#8E83A3]">Peak Forecast Day</div>
                <div className="font-bold text-sm text-[#1F1B2C] mt-0.5">
                  {forecastResult.summary.highestDay.units} units ({forecastResult.summary.highestDay.date})
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5EFFF]/60 border border-[#E5D9F2]">
                <div className="text-[#8E83A3]">Trough Forecast Day</div>
                <div className="font-bold text-sm text-[#1F1B2C] mt-0.5">
                  {forecastResult.summary.lowestDay.units} units ({forecastResult.summary.lowestDay.date})
                </div>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E5D9F2]">
            <div className="text-xs text-[#5F5670]">
              Want to see how this prediction compares against other models or how to use it for inventory?
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('comparison')}
                className="px-4 py-2 rounded-xl bg-[#F5EFFF] text-[#1F1B2C] hover:bg-[#E5D9F2] border border-[#CDC1FF] text-xs font-semibold transition-colors"
              >
                Compare Models →
              </button>
              <button
                onClick={() => onNavigate('insights')}
                className="px-4 py-2 rounded-xl bg-[#A294F9] text-white hover:bg-[#9181f7] text-xs font-semibold transition-colors"
              >
                View Business Insights →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
