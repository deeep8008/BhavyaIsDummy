import React, { useState } from 'react';
import { 
  Briefcase, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  CalendarCheck
} from 'lucide-react';
import { STORES, PRODUCTS } from '../data/mockData';

export default function BusinessInsightsPage({ onNavigate }) {
  const [activeStore, setActiveStore] = useState('CA_1');
  const [activeProduct, setActiveProduct] = useState('FOODS_3_090');

  const selectedProdObj = PRODUCTS.find(p => p.id === activeProduct) || PRODUCTS[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
          Decision Support System
        </div>
        <h1 className="text-3xl font-bold font-heading text-[#1F1B2C]">
          Business Insights
        </h1>
        <p className="text-sm text-[#5F5670] mt-1 max-w-2xl">
          Translating multi-horizon mathematical predictions into actionable decision support for store replenishment, staffing schedules, and strategic inventory buffers.
        </p>
      </div>

      {/* Advisory Notice Banner (Explicit requirement: Forecast-based decision support, not magic auto-optimizer) */}
      <div className="p-4 rounded-2xl bg-[#F5EFFF] border border-[#CDC1FF] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#A294F9] shrink-0 mt-0.5" />
        <div className="text-xs text-[#5F5670] leading-relaxed">
          <strong className="text-[#1F1B2C]">Advisory Decision Support Notice:</strong> This module translates forecasted demand volumes into operational planning guidance. It is designed to assist store managers and supply chain planners in making informed decisions rather than functioning as an automated black-box order execution system.
        </div>
      </div>

      {/* Store & Product Context Selector */}
      <section className="p-5 rounded-2xl bg-white border border-[#E5D9F2] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F5EFFF] px-3.5 py-2 rounded-xl border border-[#CDC1FF] text-xs">
            <span className="text-[#8E83A3] font-medium">Store Context:</span>
            <select
              value={activeStore}
              onChange={(e) => setActiveStore(e.target.value)}
              className="bg-transparent font-semibold text-[#1F1B2C] outline-none cursor-pointer"
            >
              {STORES.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#F5EFFF] px-3.5 py-2 rounded-xl border border-[#CDC1FF] text-xs">
            <span className="text-[#8E83A3] font-medium">Product Item:</span>
            <select
              value={activeProduct}
              onChange={(e) => setActiveProduct(e.target.value)}
              className="bg-transparent font-semibold text-[#1F1B2C] outline-none cursor-pointer"
            >
              {PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => onNavigate('forecast')}
          className="text-xs font-semibold text-[#A294F9] hover:text-[#9181f7] flex items-center gap-1.5 transition-colors"
        >
          <span>Adjust Forecast Horizon in Engine</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* 4 Core Business Insights Sections */}
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
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#E5D9F2] text-[#A294F9] font-semibold">
              Near-Term
            </span>
          </div>

          <p className="text-xs text-[#5F5670] leading-relaxed">
            Expected demand over the upcoming 28-day cycle for <strong>{selectedProdObj.name}</strong> shows an average baseline of <strong>{selectedProdObj.avgDaily} units/day</strong> with noticeable weekend velocity surges (+32%).
          </p>

          <div className="space-y-2 pt-2 border-t border-[#F5EFFF]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5F5670]">28-Day Projected Units:</span>
              <span className="font-bold text-[#1F1B2C]">~3,190 units</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5F5670]">Projected Peak Weekend:</span>
              <span className="font-bold text-[#A294F9]">158 units / day (Saturday)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5F5670]">Trough Weekday:</span>
              <span className="font-bold text-[#1F1B2C]">88 units / day (Tuesday)</span>
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
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              Safety Stock
            </span>
          </div>

          <p className="text-xs text-[#5F5670] leading-relaxed">
            Use expected demand distributions to plan warehouse reorder points and guard against potential stockouts during upcoming event windows.
          </p>

          <div className="p-3.5 rounded-2xl bg-[#F5EFFF]/70 border border-[#E5D9F2] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#5F5670]">Recommended Safety Buffer:</span>
              <span className="font-bold text-[#1F1B2C]">240 units (~2 days buffer)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#5F5670]">Reorder Trigger Point:</span>
              <span className="font-bold text-[#1F1B2C]">When inventory drops below 380 units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#5F5670]">Stockout Risk Level:</span>
              <span className="text-emerald-600 font-semibold">Low (Historical MAPE &lt; 10%)</span>
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
              Workload Shifts
            </span>
          </div>

          <p className="text-xs text-[#5F5670] leading-relaxed">
            Translate unit demand into expected backroom stocking and checkout aisle labor requirements across weekdays versus weekends.
          </p>

          <div className="space-y-2 pt-2 border-t border-[#F5EFFF] text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#5F5670]">Friday–Sunday Stocking Shifts:</span>
              <span className="font-bold text-[#1F1B2C]">+2 Additional Replenishment Shifts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5F5670]">Warehouse Case Handling:</span>
              <span className="font-bold text-[#1F1B2C]">Peak intake required by Thursday 4 PM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5F5670]">Workload Consistency:</span>
              <span className="font-medium text-emerald-600">Stable weekly pattern</span>
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
                4. Strategic 90-Day Planning
              </h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
              Quarterly Horizon
            </span>
          </div>

          <p className="text-xs text-[#5F5670] leading-relaxed">
            Leverage 90-day multi-horizon predictions to negotiate supplier volume discounts, secure long-lead transport freight, and allocate distribution center pallet space.
          </p>

          <div className="p-3.5 rounded-2xl bg-[#F5EFFF]/70 border border-[#E5D9F2] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#5F5670]">Quarterly Volume Run-Rate:</span>
              <span className="font-bold text-[#1F1B2C]">~10,250 units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#5F5670]">Supplier Lead-Time Window:</span>
              <span className="font-semibold text-[#1F1B2C]">Place master PO 18 days in advance</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#5F5670]">Seasonal Storage Space:</span>
              <span className="text-[#A294F9] font-semibold">Allocate 14 pallet bays in DC-West</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
