import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { DatasetProvider } from './context/DatasetContext';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import GenerateForecastPage from './pages/GenerateForecastPage';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('forecastiq_active_tab') || 'home';
    } catch {
      return 'home';
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('forecastiq_active_tab', tab);
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <AuthProvider>
      <DatasetProvider>
        <div className="min-h-screen bg-[#F5EFFF] text-[#1F1B2C] flex">
          {/* Fixed Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleTabChange} 
            mobileOpen={mobileOpen} 
            setMobileOpen={setMobileOpen} 
          />

          {/* Main Content Area */}
          <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
            {/* Top Header */}
            <Header 
              activeTab={activeTab} 
              onMobileToggle={() => setMobileOpen(true)} 
            />

            {/* Page Content */}
            <main className="flex-1 p-6 sm:p-8 lg:p-10">
              <ErrorBoundary>
                {activeTab === 'home' ? (
                  <HomePage onNavigate={handleTabChange} />
                ) : (
                  <GenerateForecastPage onNavigate={handleTabChange} />
                )}
              </ErrorBoundary>
            </main>

            {/* Minimal Clean Footer */}
            <footer className="px-8 py-5 border-t border-[#E5D9F2]/70 text-xs text-[#8E83A3] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <strong>ForecastIQ</strong> — Enterprise Multi-Horizon Time-Series Forecasting & Model Evaluation
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span>Chronological 80/20 Backtesting</span>
                <span>•</span>
                <span>Zero Data Leakage</span>
                <span>•</span>
                <span className="text-[#A294F9] font-semibold">100% History Retrained</span>
              </div>
            </footer>
          </div>

          {/* Authentication Modal */}
          <AuthModal />
        </div>
      </DatasetProvider>
    </AuthProvider>
  );
}
