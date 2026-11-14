import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Headphones,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-slate-900 overflow-hidden">
      {/* ========================================================= */}
      {/* LEFT SIDE: Image Section (Fixed full-height, no scroll)   */}
      {/* ========================================================= */}
      <div className="relative hidden lg:block lg:w-1/2 xl:w-[52%] h-full overflow-hidden bg-slate-950">
        <img
          src="/images/login-banner.jpg"
          alt="WhatsApp Business SaaS Platform"
          className="w-full h-full object-cover select-none"
        />

        {/* Ambient Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/30 pointer-events-none" />

        {/* Minimal Floating Brand Badge */}
        <div className="absolute top-6 left-6 flex items-center space-x-2.5 bg-slate-950/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-xl">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">
              WhatsApp Business SaaS
            </span>
            <span className="text-[10px] text-slate-300">
              Meta Cloud API Platform
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT SIDE: Login Form (Fixed screen, no scrolling)       */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-6 sm:px-10 lg:px-12 xl:px-16 bg-white h-full overflow-hidden">
        <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-4">
          {/* Mobile-Only Header */}
          <div className="lg:hidden text-center mb-1">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30 mb-2">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">WhatsApp Business SaaS</h1>
          </div>

          {/* Form Header */}
          <div className="space-y-0.5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign in to workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your details or choose a quick 1-click test role below.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 hover:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset instructions sent to workspace admin.');
                  }}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 hover:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-600 select-none">Remember this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Credentials (Compact 3-column layout) */}
          <div className="pt-1">
            <div className="relative flex items-center justify-center mb-2.5">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                1-Click Quick Demo Logins
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@platform.com', 'Admin@123456')}
                className="group p-2 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-center flex flex-col items-center justify-center"
              >
                <div className="w-6 h-6 rounded-md bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-600 mb-1 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 block leading-tight">Super Admin</span>
                <span className="text-[10px] text-slate-400 truncate w-full">admin@platform</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('client@acme.com', 'Client@123456')}
                className="group p-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-center flex flex-col items-center justify-center"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1 transition-colors">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 block leading-tight">Client Admin</span>
                <span className="text-[10px] text-slate-400 truncate w-full">client@acme</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('agent@acme.com', 'Agent@123456')}
                className="group p-2 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all text-center flex flex-col items-center justify-center"
              >
                <div className="w-6 h-6 rounded-md bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center text-teal-600 mb-1 transition-colors">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 block leading-tight">Support Agent</span>
                <span className="text-[10px] text-slate-400 truncate w-full">agent@acme</span>
              </button>
            </div>
          </div>

          {/* Register Link & Footer */}
          <div className="pt-1 space-y-1.5 text-center">
            <p className="text-xs text-slate-500">
              Need a new workspace?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                Create Client Account
              </Link>
            </p>

            <p className="text-[10px] text-slate-400">
              Protected by enterprise-grade security and Meta Cloud API protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
