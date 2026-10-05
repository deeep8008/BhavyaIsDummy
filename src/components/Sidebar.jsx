import React from 'react';
import { 
  Home, 
  Zap, 
  Layers, 
  Database,
  LogIn,
  LogOut,
  UploadCloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataset } from '../context/DatasetContext';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { user, isAuthenticated, signOut, openAuthModal } = useAuth();
  const { activeDatasetId, datasetSummary, backendOnline } = useDataset();

  // Exactly two primary tabs requested by user
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, badge: null },
    { id: 'forecast', label: 'Generate Forecast', icon: Zap, badge: '5 Models' },
  ];

  const getInitials = (name) => {
    if (!name) return 'EP';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const obsCount = datasetSummary?.total_observations != null 
    ? Number(datasetSummary.total_observations).toLocaleString() 
    : 'Ready';

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E5D9F2] flex flex-col justify-between
        transition-transform duration-200 ease-in-out lg:translate-x-0
        ${mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand & Header */}
        <div>
          <div className="p-6 border-b border-[#F5EFFF]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A294F9] to-[#CDC1FF] flex items-center justify-center text-white shadow-xs">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-heading text-[#1F1B2C] tracking-tight leading-none">
                  Forecast<span className="text-[#A294F9]">IQ</span>
                </h1>
                <p className="text-xs text-[#5F5670] mt-1 font-medium">
                  Demand Forecasting Engine
                </p>
              </div>
            </div>
          </div>

          {/* Clean Navigation Links: Only Home & Generate Forecast */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8E83A3] uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (setMobileOpen) setMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-[#F5EFFF] text-[#1F1B2C] border border-[#CDC1FF] font-bold shadow-xs' 
                      : 'text-[#5F5670] hover:bg-[#F5EFFF]/60 hover:text-[#1F1B2C]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#A294F9]' : 'text-[#8E83A3]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive 
                        ? 'bg-[#A294F9] text-white' 
                        : 'bg-[#E5D9F2]/70 text-[#5F5670]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div>
          {/* Active Dataset Status Card */}
          <div className="p-4 m-3 rounded-2xl bg-[#F5EFFF] border border-[#E5D9F2] text-[#1F1B2C]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E83A3]">
                Dataset Status
              </span>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border shadow-xs ${
                backendOnline ? 'text-emerald-600 bg-white border-emerald-100' : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {backendOnline ? 'Engine Online' : 'Backend Offline'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-semibold text-xs text-[#1F1B2C] truncate" title={activeDatasetId}>
                {datasetSummary?.dataset_name || activeDatasetId || 'Generic Dataset'}
              </div>
              <div className="text-[11px] text-[#5F5670] leading-relaxed">
                • {obsCount} observations<br />
                • {datasetSummary?.series_count ?? 1} series<br />
                • Freq: {datasetSummary?.frequency || 'Daily'}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('forecast')}
              className="w-full mt-3 pt-2 pb-1 border-t border-[#E5D9F2]/80 flex items-center justify-between text-[11px] text-[#A294F9] font-bold hover:text-[#8c7cf0] cursor-pointer"
            >
              <span>Upload / Change Data</span>
              <span>→</span>
            </button>
          </div>

          {/* User Profile / Auth Area in Sidebar */}
          <div className="px-3 pb-3">
            {isAuthenticated && user ? (
              <div className="p-2.5 rounded-2xl bg-white border border-[#E5D9F2] flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-[#E5D9F2] text-[#1F1B2C] font-semibold text-xs flex items-center justify-center shrink-0 border border-[#CDC1FF]">
                    {getInitials(user.name)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-[#1F1B2C] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-[#8E83A3] truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-1.5 rounded-xl text-[#8E83A3] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('signin');
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#A294F9] to-[#8c7cf0] text-white text-xs font-semibold hover:opacity-95 transition-all shadow-xs shadow-[#A294F9]/20 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
