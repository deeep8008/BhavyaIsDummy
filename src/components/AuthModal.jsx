import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    setAuthModalMode, 
    signIn, 
    signUp 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Supply Chain Planner');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset errors when mode changes
    setError('');
  }, [authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (authModalMode === 'signin') {
        await signIn({ email, password, remember: rememberMe });
      } else {
        await signUp({ name, email, password, role });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('planner@forecastiq.com');
    setPassword('Password123!');
    setAuthModalMode('signin');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={closeAuthModal} 
        className="fixed inset-0 bg-[#1F1B2C]/50 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E5D9F2] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Accent Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-[#A294F9] via-[#CDC1FF] to-[#E5D9F2]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[#F5EFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5EFFF] border border-[#CDC1FF] flex items-center justify-center text-[#A294F9]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1F1B2C]">
                {authModalMode === 'signin' ? 'Sign In to ForecastIQ' : 'Create an Account'}
              </h3>
              <p className="text-xs text-[#8E83A3]">
                {authModalMode === 'signin' 
                  ? 'Access multi-horizon demand intelligence' 
                  : 'Start planning enterprise demand forecasts'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl text-[#8E83A3] hover:text-[#1F1B2C] hover:bg-[#F5EFFF] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Switcher Tabs */}
        <div className="px-6 pt-4">
          <div className="flex bg-[#F5EFFF] p-1 rounded-2xl border border-[#E5D9F2]">
            <button
              type="button"
              onClick={() => setAuthModalMode('signin')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                authModalMode === 'signin'
                  ? 'bg-white text-[#1F1B2C] shadow-xs'
                  : 'text-[#8E83A3] hover:text-[#1F1B2C]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode('signup')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                authModalMode === 'signup'
                  ? 'bg-white text-[#1F1B2C] shadow-xs'
                  : 'text-[#8E83A3] hover:text-[#1F1B2C]'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authModalMode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#1F1B2C] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E83A3]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFFF]/40 border border-[#E5D9F2] rounded-xl text-sm text-[#1F1B2C] placeholder-[#8E83A3] focus:outline-none focus:border-[#A294F9] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1B2C] mb-1.5">
                  Role / Department
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E83A3]" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Supply Chain Planner"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFFF]/40 border border-[#E5D9F2] rounded-xl text-sm text-[#1F1B2C] placeholder-[#8E83A3] focus:outline-none focus:border-[#A294F9] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1F1B2C] mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E83A3]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5EFFF]/40 border border-[#E5D9F2] rounded-xl text-sm text-[#1F1B2C] placeholder-[#8E83A3] focus:outline-none focus:border-[#A294F9] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#1F1B2C]">
                Password
              </label>
              {authModalMode === 'signin' && (
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-medium text-[#A294F9] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Fill Demo
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E83A3]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={authModalMode === 'signup' ? 'Min 6 characters' : '••••••••'}
                className="w-full pl-10 pr-10 py-2.5 bg-[#F5EFFF]/40 border border-[#E5D9F2] rounded-xl text-sm text-[#1F1B2C] placeholder-[#8E83A3] focus:outline-none focus:border-[#A294F9] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E83A3] hover:text-[#1F1B2C]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {authModalMode === 'signin' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#5F5670]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#A294F9] border-[#CDC1FF] focus:ring-[#A294F9]"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs text-[#8E83A3] hover:text-[#1F1B2C]"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#A294F9] to-[#8c7cf0] text-white font-semibold text-sm shadow-md shadow-[#A294F9]/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{authModalMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info box */}
        <div className="bg-[#F5EFFF]/70 px-6 py-3.5 border-t border-[#E5D9F2] text-center text-xs text-[#8E83A3]">
          {authModalMode === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => setAuthModalMode('signup')}
                className="text-[#A294F9] font-semibold hover:underline"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button 
                type="button" 
                onClick={() => setAuthModalMode('signin')}
                className="text-[#A294F9] font-semibold hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
