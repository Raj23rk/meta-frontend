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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900">
      {/* ========================================================= */}
      {/* LEFT SIDE: Image Section (All text content removed)       */}
      {/* ========================================================= */}
      <div className="relative hidden lg:block lg:w-1/2 xl:w-[52%] overflow-hidden bg-slate-950">
        <img
          src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1600&q=80"
          alt="WhatsApp Customer Messaging"
          className="w-full h-full object-cover"
        />

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-slate-950/40" />

        {/* Minimal Floating Brand Badge */}
        <div className="absolute top-8 left-8 flex items-center space-x-3 bg-slate-950/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block leading-tight">
              WhatsApp Business SaaS
            </span>
            <span className="text-[11px] text-slate-300">
              Meta Cloud API Platform
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT SIDE: Login Form                                    */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-white min-h-screen overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Mobile-Only Header */}
          <div className="lg:hidden text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">WhatsApp Business SaaS</h1>
            <p className="text-xs text-slate-500 mt-0.5">Multi-Client WhatsApp Management Platform</p>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to workspace
            </h2>
            <p className="text-sm text-slate-500">
              Welcome back! Please enter your details or use a 1-click test role.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 hover:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link has been dispatched to workspace administrator.');
                  }}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 hover:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-600 select-none">Remember this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Credentials */}
          <div className="pt-2">
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                1-Click Quick Demo Logins
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@platform.com', 'Admin@123456')}
                className="group text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all flex items-center justify-between text-xs font-medium text-slate-700"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block leading-tight">Super Admin</span>
                    <span className="text-[11px] text-slate-400">admin@platform.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md group-hover:bg-indigo-100 transition-colors">
                  Fill Credentials
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('client@acme.com', 'Client@123456')}
                className="group text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all flex items-center justify-between text-xs font-medium text-slate-700"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block leading-tight">Client Admin (Acme)</span>
                    <span className="text-[11px] text-slate-400">client@acme.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md group-hover:bg-emerald-100 transition-colors">
                  Fill Credentials
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('agent@acme.com', 'Agent@123456')}
                className="group text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-teal-200 hover:bg-teal-50/40 transition-all flex items-center justify-between text-xs font-medium text-slate-700"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center text-teal-600 transition-colors">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block leading-tight">Support Agent</span>
                    <span className="text-[11px] text-slate-400">agent@acme.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md group-hover:bg-teal-100 transition-colors">
                  Fill Credentials
                </span>
              </button>
            </div>
          </div>

          {/* Register Link & Footer */}
          <div className="pt-2 space-y-4 text-center">
            <p className="text-xs text-slate-500">
              Need a new workspace?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                Create Client Account
              </Link>
            </p>

            <p className="text-[11px] text-slate-400">
              Protected by enterprise-grade security and Meta Cloud API protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
