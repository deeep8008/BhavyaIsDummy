import { 
  Briefcase, 
  Package, 
  Users, 
  TrendingUp, 
  Info, 
  ArrowRight, 
  Truck, 
  Download
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

export default function BusinessInsightsPage({ onNavigate }) {
  const { 
    forecastResult, 
    exportForecastToCsv
  } = useDataset();

  const insights = forecastResult?.insights;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
            Decision Support System (Phase 4)
          </div>
          <h1 className="text-3xl font-bold font-heading text-[#1F1B2C]">
            Business Insights & Planning Guidance
          </h1>
          <p className="text-sm text-[#5F5670] mt-1 max-w-2xl">
            Translating multi-horizon mathematical predictions into actionable decision support for store replenishment, staffing schedules, and inventory buffers.
          </p>
        </div>

        {forecastResult && (
          <button
            onClick={exportForecastToCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#CDC1FF] text-xs font-semibold text-[#1F1B2C] hover:bg-[#F5EFFF] shadow-xs cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-[#A294F9]" />
            <span>Export Forecast CSV</span>
          </button>
        )}
      </div>

      {/* Advisory Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#F5EFFF] border border-[#CDC1FF] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#A294F9] shrink-0 mt-0.5" />
        <div className="text-xs text-[#5F5670] leading-relaxed">
          <strong className="text-[#1F1B2C]">Advisory Decision Support Notice:</strong> This module translates forecasted demand volumes into operational planning guidance. It is designed to assist store managers and supply chain planners in making informed decisions rather than functioning as an automated black-box order execution system.
        </div>
      </div>

      {/* Forecast Status Badge */}
      {forecastResult ? (
        <div className="p-4 rounded-2xl bg-white border border-[#E5D9F2] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-[#1F1B2C]">Active Forecast Insights:</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#F5EFFF] text-[#1F1B2C] border border-[#CDC1FF] font-medium">
              Dataset: {forecastResult.dataset_id}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#F5EFFF] text-[#1F1B2C] border border-[#CDC1FF] font-medium">
              Series: {forecastResult.series_id}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#E5D9F2] text-[#1F1B2C] border border-[#CDC1FF] font-bold">
              Model: {forecastResult.selected_model.toUpperCase()} ({forecastResult.horizon} Days)
            </span>
          </div>

          <button
            onClick={() => onNavigate('forecast')}
            className="text-xs font-semibold text-[#A294F9] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Change Model / Horizon</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white border border-[#E5D9F2] text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F5EFFF] text-[#A294F9] flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1F1B2C]">No Future Forecast Generated Yet</h3>
          <p className="text-xs text-[#5F5670] max-w-md mx-auto">
            Generate a future forecast using the 100% retraining engine to populate mathematical demand outlooks and inventory recommendations.
          </p>
          <button
            onClick={() => onNavigate('forecast')}
            className="px-6 py-2.5 rounded-xl bg-[#A294F9] text-white text-xs font-bold hover:bg-[#9181f7] shadow-xs cursor-pointer"
          >
            Generate Forecast Now →
          </button>
        </div>
      )}

      {/* 4 Core Business Insights Sections */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Demand Outlook */}
          <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F5EFFF] text-[#A294F9]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold font-heading text-[#1F1B2C]">
                  1. Demand Outlook
                </h2>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E5D9F2] text-[#A294F9] font-semibold capitalize">
                {insights.demand_trend} Trend
              </span>
            </div>

            <p className="text-xs text-[#5F5670] leading-relaxed">
              Expected demand over the upcoming {forecastResult.horizon}-day horizon projects an average baseline of <strong>{insights.average_daily_demand.toFixed(1)} units/day</strong> with a projected {insights.demand_trend} trajectory.
            </p>

            <div className="space-y-2 pt-2 border-t border-[#F5EFFF]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5F5670]">{forecastResult.horizon}-Day Projected Volume:</span>
                <span className="font-bold text-[#1F1B2C]">{Math.round(insights.total_projected_volume).toLocaleString()} units</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5F5670]">Projected Peak Day:</span>
                <span className="font-bold text-[#A294F9]">{insights.peak_demand_value.toFixed(1)} units ({insights.peak_demand_date})</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5F5670]">Projected Trough (Min) Day:</span>
                <span className="font-bold text-[#1F1B2C]">{insights.min_demand_value.toFixed(1)} units ({insights.min_demand_date})</span>
              </div>
            </div>
          </section>

          {/* Section 2: Inventory Planning */}
          <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F5EFFF] text-[#A294F9]">
                  <Package className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold font-heading text-[#1F1B2C]">
                  2. Inventory Planning Support
                </h2>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                insights.stockout_risk_status === 'high_risk' ? 'bg-rose-100 text-rose-700' :
                insights.stockout_risk_status === 'moderate_risk' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {insights.stockout_risk_status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-[#5F5670] leading-relaxed">
              Use expected demand distributions to plan warehouse safety stocks and trigger reorder thresholds before reaching lead-time critical buffers.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#F5EFFF]/70 border border-[#E5D9F2] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#5F5670]">Recommended Safety Stock Buffer:</span>
                <span className="font-bold text-[#1F1B2C]">{Math.round(insights.recommended_safety_stock)} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5F5670]">Uncertainty Formula:</span>
                <span className="font-mono text-[#8E83A3] text-[10px]">{insights.safety_stock_method}</span>
              </div>
              <div className="pt-2 border-t border-[#E5D9F2]/70 text-[11px] text-[#5F5670]">
                <strong>Stockout Evaluation:</strong> {insights.stockout_risk_message}
                {insights.estimated_stockout_date && (
                  <div className="text-rose-600 font-bold mt-0.5">
                    Estimated Stockout Date: {insights.estimated_stockout_date}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Staffing Planning */}
          <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F5EFFF] text-[#A294F9]">
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold font-heading text-[#1F1B2C]">
                  3. Staffing & Labor Planning
                </h2>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E5D9F2] text-[#A294F9] font-semibold">
                Workload Schedule
              </span>
            </div>

            <p className="text-xs text-[#5F5670] leading-relaxed">
              Translate daily units into fulfillment shifts, receiving team schedules, and checkout staffing allocations.
            </p>

            <div className="space-y-2 pt-2 border-t border-[#F5EFFF] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5F5670]">Projected Peak Workload Day:</span>
                <span className="font-bold text-[#1F1B2C]">Allocate +2 Replenishment Staff on {insights.peak_demand_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5F5670]">Weekly Workload Consistency:</span>
                <span className="font-medium text-emerald-600">Stable operations profile</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5F5670]">Daily Case Handling Capacity:</span>
                <span className="font-semibold text-[#1F1B2C]">~{Math.round(insights.average_daily_demand * 1.25)} cases/day buffer</span>
              </div>
            </div>
          </section>

          {/* Section 4: Long-Term Strategic Planning */}
          <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F5EFFF] text-[#A294F9]">
                  <Truck className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold font-heading text-[#1F1B2C]">
                  4. Supply Chain PO Guidance
                </h2>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                Master PO Commitments
              </span>
            </div>

            <p className="text-xs text-[#5F5670] leading-relaxed">
              Leverage the total {forecastResult.horizon}-day projected volume to negotiate supplier volume discounts and schedule freight dock appointments.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#F5EFFF]/70 border border-[#E5D9F2] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#5F5670]">Horizon Total Requirement:</span>
                <span className="font-bold text-[#1F1B2C]">{Math.round(insights.total_projected_volume)} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5F5670]">Master PO Window:</span>
                <span className="font-semibold text-[#1F1B2C]">Place orders 7–14 days prior to horizon start</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5F5670]">Uncertainty Allowance:</span>
                <span className="text-[#A294F9] font-semibold">Include ±{Math.round(insights.recommended_safety_stock)} units flexibility</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Forecast Data Table with Export */}
      {forecastResult && (
        <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
                Daily Projected Demand Points & Confidence Bounds
              </h3>
              <p className="text-xs text-[#5F5670]">
                Complete numerical table of future predictions for {forecastResult.horizon} days.
              </p>
            </div>

            <button
              onClick={exportForecastToCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A294F9] text-white text-xs font-bold hover:bg-[#9181f7] shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV File</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#E5D9F2] rounded-2xl max-h-80">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F5EFFF] text-[#8E83A3] sticky top-0">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold text-[#A294F9]">Point Prediction</th>
                  <th className="py-2.5 px-4 font-semibold">80% Lower</th>
                  <th className="py-2.5 px-4 font-semibold">80% Upper</th>
                  <th className="py-2.5 px-4 font-semibold">95% Lower</th>
                  <th className="py-2.5 px-4 font-semibold">95% Upper</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EFFF]">
                {forecastResult.forecast.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F5EFFF]/30">
                    <td className="py-2 px-4 font-medium text-[#1F1B2C]">{row.timestamp}</td>
                    <td className="py-2 px-4 font-bold text-[#A294F9]">{row.prediction.toFixed(2)}</td>
                    <td className="py-2 px-4 text-[#5F5670]">{row.lower_80.toFixed(2)}</td>
                    <td className="py-2 px-4 text-[#5F5670]">{row.upper_80.toFixed(2)}</td>
                    <td className="py-2 px-4 text-[#8E83A3]">{row.lower_95.toFixed(2)}</td>
                    <td className="py-2 px-4 text-[#8E83A3]">{row.upper_95.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
