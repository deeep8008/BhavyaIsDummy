import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Search, 
  Calendar, 
  DollarSign, 
  Layers, 
  Store, 
  TrendingUp, 
  Info,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { STORES, CATEGORIES, PRODUCTS } from '../data/mockData';

export default function DataExplorerPage({ onNavigate }) {
  const [selectedState, setSelectedState] = useState('CA');
  const [selectedStore, setSelectedStore] = useState('CA_1');
  const [selectedCategory, setSelectedCategory] = useState('FOODS');
  const [selectedProduct, setSelectedProduct] = useState('FOODS_3_090');
  const [dateRange, setDateRange] = useState('90d');
  const [showMovingAvg, setShowMovingAvg] = useState(true);

  // Filter stores by selected state
  const availableStores = useMemo(() => {
    return STORES.filter(s => s.state === selectedState);
  }, [selectedState]);

  // Filter products by selected category
  const availableProducts = useMemo(() => {
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const currentProduct = useMemo(() => {
    return PRODUCTS.find(p => p.id === selectedProduct) || PRODUCTS[0];
  }, [selectedProduct]);

  // Generate historical sales points for the explorer
  const salesHistory = useMemo(() => {
    const days = dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 180;
    const list = [];
    const base = currentProduct.avgDaily;
    const storeMultiplier = selectedStore.startsWith('CA') ? 1.15 : selectedStore.startsWith('TX') ? 0.95 : 0.9;
    
    for (let i = days; i >= 1; i--) {
      const d = new Date('2016-04-24');
      d.setDate(d.getDate() - i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const weekendBoost = isWeekend ? 1.3 : 0.92;
      const noise = Math.sin(i * 1.5) * 0.18 + Math.cos(i * 0.7) * 0.12;
      const isPromo = i === 12 || i === 42 || i === 70;
      const promoBoost = isPromo ? 1.45 : 1.0;
      
      const sales = Math.max(0, Math.round(base * storeMultiplier * weekendBoost * (1 + noise) * promoBoost));
      
      // Moving avg 7-day
      list.push({
        date: d.toISOString().split('T')[0],
        sales,
        isWeekend,
        isPromo,
        promoName: isPromo ? (i === 12 ? 'Spring Promotion' : i === 42 ? 'SNAP Benefit Start' : 'Weekend Flash Sale') : null,
        price: currentProduct.currentPrice - (isPromo ? 0.2 : 0)
      });
    }

    // Compute rolling 7-day average
    return list.map((item, idx, arr) => {
      const windowStart = Math.max(0, idx - 6);
      const windowItems = arr.slice(windowStart, idx + 1);
      const avg = Math.round(windowItems.reduce((acc, curr) => acc + curr.sales, 0) / windowItems.length);
      return { ...item, rollingAvg: avg };
    });
  }, [currentProduct, selectedStore, dateRange]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const total = salesHistory.reduce((acc, item) => acc + item.sales, 0);
    const avg = (total / salesHistory.length).toFixed(1);
    const max = Math.max(...salesHistory.map(s => s.sales));
    const zeroDays = salesHistory.filter(s => s.sales === 0).length;
    const zeroPct = ((zeroDays / salesHistory.length) * 100).toFixed(1);
    return { total, avg, max, zeroDays, zeroPct };
  }, [salesHistory]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Subtitle */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
          M5 Dataset Exploration
        </div>
        <h1 className="text-3xl font-bold font-heading text-[#1F1B2C]">
          Data Explorer
        </h1>
        <p className="text-sm text-[#5F5670] mt-1 max-w-2xl">
          Inspect historical sales velocity, price changes, calendar events, and store distributions before training or inference.
        </p>
      </div>

      {/* Top Filter Bar */}
      <section className="p-5 rounded-2xl bg-white border border-[#E5D9F2] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* State */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              1. State
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                const nextStore = STORES.find(s => s.state === e.target.value);
                if (nextStore) setSelectedStore(nextStore.id);
              }}
              className="w-full bg-[#F5EFFF] border border-[#CDC1FF] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1B2C] outline-none"
            >
              <option value="CA">California (CA)</option>
              <option value="TX">Texas (TX)</option>
              <option value="WI">Wisconsin (WI)</option>
            </select>
          </div>

          {/* Store */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              2. Store
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full bg-[#F5EFFF] border border-[#CDC1FF] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1B2C] outline-none"
            >
              {availableStores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              3. Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                const nextProd = PRODUCTS.find(p => p.category === e.target.value);
                if (nextProd) setSelectedProduct(nextProd.id);
              }}
              className="w-full bg-[#F5EFFF] border border-[#CDC1FF] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1B2C] outline-none"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              4. Product Series
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-[#F5EFFF] border border-[#CDC1FF] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F1B2C] outline-none truncate"
            >
              {availableProducts.map(p => (
                <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3] mb-1.5">
              5. Date Window
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[#F5EFFF] p-1 rounded-xl border border-[#CDC1FF]">
              {[
                { id: '30d', label: '30D' },
                { id: '90d', label: '90D' },
                { id: '180d', label: '180D' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setDateRange(opt.id)}
                  className={`py-1.5 text-center text-xs rounded-lg font-medium transition-all ${
                    dateRange === opt.id 
                      ? 'bg-[#A294F9] text-white shadow-xs font-bold' 
                      : 'text-[#5F5670] hover:text-[#1F1B2C]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
              Historical Sales Trend ({dateRange.toUpperCase()})
            </h2>
            <p className="text-xs text-[#5F5670]">
              Daily observations showing weekly recurring peaks and promotional spikes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMovingAvg(!showMovingAvg)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                showMovingAvg 
                  ? 'bg-[#E5D9F2] text-[#1F1B2C] border-[#CDC1FF] font-semibold' 
                  : 'bg-white text-[#5F5670] border-[#E5D9F2]'
              }`}
            >
              {showMovingAvg ? '✓ 7-Day Moving Avg Enabled' : '+ Show 7-Day Moving Avg'}
            </button>
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="relative w-full h-64 bg-[#F5EFFF]/30 rounded-2xl border border-[#E5D9F2] p-4 flex flex-col justify-end">
          <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible">
            {/* Grid */}
            {[0, 50, 100, 150].map((yVal, i) => (
              <line 
                key={i} 
                x1="0" 
                y1={200 - yVal} 
                x2="800" 
                y2={200 - yVal} 
                stroke="#E5D9F2" 
                strokeDasharray="3 3" 
              />
            ))}

            {/* Daily sales points / line */}
            <path
              d={salesHistory.map((pt, i) => {
                const x = (i / (salesHistory.length - 1)) * 800;
                const y = 200 - (pt.sales / summaryStats.max) * 170;
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
                d={salesHistory.map((pt, i) => {
                  const x = (i / (salesHistory.length - 1)) * 800;
                  const y = 200 - (pt.rollingAvg / summaryStats.max) * 170;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#5F5670"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            )}

            {/* Event Markers */}
            {salesHistory.map((pt, i) => {
              if (!pt.isPromo) return null;
              const x = (i / (salesHistory.length - 1)) * 800;
              const y = 200 - (pt.sales / summaryStats.max) * 170;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="5" fill="#A294F9" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1={x} y1={y} x2={x} y2={195} stroke="#CDC1FF" strokeWidth="1" strokeDasharray="2 2" />
                </g>
              );
            })}
          </svg>

          <div className="flex items-center justify-between text-[11px] text-[#8E83A3] mt-2">
            <span>{salesHistory[0]?.date}</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#A294F9] inline-block"></span>
                Daily Sales
              </span>
              {showMovingAvg && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#5F5670] inline-block"></span>
                  7-Day Rolling Trend
                </span>
              )}
            </div>
            <span>{salesHistory[salesHistory.length - 1]?.date} (Cutoff)</span>
          </div>
        </div>
      </section>

      {/* Grid: Sections B, C, D */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section B: Sales by Store Comparison */}
        <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Section B
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
              Sales by Store
            </h3>
            <p className="text-xs text-[#5F5670]">
              Relative store volume across state retail network.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { id: 'CA_1', name: 'California 1', val: 124, pct: 100 },
              { id: 'CA_2', name: 'California 2', val: 108, pct: 87 },
              { id: 'CA_3', name: 'California 3', val: 95, pct: 76 },
              { id: 'TX_1', name: 'Texas 1', val: 86, pct: 69 },
              { id: 'WI_1', name: 'Wisconsin 1', val: 82, pct: 66 }
            ].map(item => (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={`font-semibold ${item.id === selectedStore ? 'text-[#A294F9]' : 'text-[#1F1B2C]'}`}>
                    {item.name} {item.id === selectedStore ? '(Selected)' : ''}
                  </span>
                  <span className="text-[#5F5670] font-medium">{item.val} avg units/day</span>
                </div>
                <div className="h-2 w-full bg-[#F5EFFF] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      item.id === selectedStore ? 'bg-[#A294F9]' : 'bg-[#CDC1FF]'
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section C: Sales by Category */}
        <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Section C
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
              Category Share
            </h3>
            <p className="text-xs text-[#5F5670]">
              High-level demand distribution in {selectedStore}.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { id: 'FOODS', name: 'Foods & Perishables', share: '68%', color: '#A294F9', count: '1,437 items' },
              { id: 'HOUSEHOLD', name: 'Household Staples', share: '22%', color: '#CDC1FF', count: '1,047 items' },
              { id: 'HOBBIES', name: 'Hobbies & Crafts', share: '10%', color: '#E5D9F2', count: '565 items' }
            ].map(cat => (
              <div 
                key={cat.id} 
                className={`p-3.5 rounded-2xl border transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-[#F5EFFF] border-[#CDC1FF] shadow-xs' 
                    : 'bg-white border-[#E5D9F2]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span className="text-xs font-bold text-[#1F1B2C]">{cat.name}</span>
                  </div>
                  <span className="text-xs font-bold text-[#1F1B2C]">{cat.share}</span>
                </div>
                <div className="text-[11px] text-[#8E83A3] mt-1 pl-5.5">
                  {cat.count} in store inventory
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section D: Price Trend */}
        <section className="p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Section D
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
              Price Movement
            </h3>
            <p className="text-xs text-[#5F5670]">
              Historical shelf price changes from sell_prices.csv.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5EFFF]/70 border border-[#E5D9F2] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5F5670]">Current Base Price:</span>
              <span className="text-lg font-bold text-[#1F1B2C]">${currentProduct.currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5F5670]">Promotional Discount:</span>
              <span className="text-emerald-600 font-semibold">- $0.20 on feature events</span>
            </div>
            <div className="text-[11px] text-[#8E83A3] leading-relaxed pt-2 border-t border-[#E5D9F2]">
              Price elasticity coefficients are automatically included in LightGBM and Temporal Fusion Transformer covariate pipelines.
            </div>
          </div>
        </section>
      </div>

      {/* Sections E & F: Calendar Events and Data Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section E: Calendar & Event Timeline */}
        <section className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Section E
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
              Calendar & External Event Signals
            </h3>
            <p className="text-xs text-[#5F5670]">
              Calendar variables mapped from calendar.csv (Holidays, SNAP benefits, Sporting events).
            </p>
          </div>

          <div className="space-y-3">
            {[
              { name: 'SNAP Benefit Days (CA)', type: 'National Assistance', impact: '+18% Grocery Uplift', date: 'Days 1–10 of every month' },
              { name: 'Super Bowl Sporting Event', type: 'Sporting', impact: '+35% Snack & Beverage Surge', date: 'Annual February fixture' },
              { name: 'Easter Holiday Weekend', type: 'Cultural Holiday', impact: '+22% Bakery & Dairy Spike', date: 'Spring seasonal cycle' }
            ].map((ev, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#F5EFFF] border border-[#E5D9F2] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1F1B2C]">{ev.name}</div>
                  <div className="text-[11px] text-[#5F5670]">{ev.type} • {ev.date}</div>
                </div>
                <span className="text-xs font-semibold text-[#A294F9] bg-white px-2.5 py-1 rounded-lg border border-[#CDC1FF]">
                  {ev.impact}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section F: Data Summary Card */}
        <section className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[#E5D9F2] shadow-xs space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8E83A3]">
              Section F
            </div>
            <h3 className="text-lg font-bold font-heading text-[#1F1B2C]">
              Series Summary Card
            </h3>
            <p className="text-xs text-[#5F5670]">
              Integrity parameters for the selected time-series.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F5EFFF]">
              <span className="text-[#5F5670]">Selected Store:</span>
              <span className="font-semibold text-[#1F1B2C]">{selectedStore} ({selectedState})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F5EFFF]">
              <span className="text-[#5F5670]">Selected Series ID:</span>
              <span className="font-semibold text-[#1F1B2C]">{currentProduct.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F5EFFF]">
              <span className="text-[#5F5670]">Observation Count:</span>
              <span className="font-semibold text-[#1F1B2C]">{salesHistory.length} Days</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F5EFFF]">
              <span className="text-[#5F5670]">Average Daily Demand:</span>
              <span className="font-semibold text-[#A294F9]">{summaryStats.avg} units</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F5EFFF]">
              <span className="text-[#5F5670]">Peak Day Demand:</span>
              <span className="font-semibold text-[#1F1B2C]">{summaryStats.max} units</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#5F5670]">Zero-Sales Frequency:</span>
              <span className="font-semibold text-emerald-600">{summaryStats.zeroPct}% (Dense Series)</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('forecast')}
              className="w-full py-2.5 rounded-xl bg-[#A294F9] text-white text-xs font-semibold hover:bg-[#9181f7] shadow-xs transition-colors"
            >
              Configure Forecast for this Product →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
