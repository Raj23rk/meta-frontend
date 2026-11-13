import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, ShieldCheck, UserCheck, Headphones } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0B1528] to-[#06241E] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/30 mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">WhatsApp Business SaaS</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Multi-Client WhatsApp Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Sign in to workspace</h2>
          <p className="text-xs text-slate-500 mb-6">Enter your credentials or choose a quick role below</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Test Logins (1-Click)
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@platform.com', 'Admin@123456')}
                className="text-left px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs font-medium text-slate-700"
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Super Admin</span>
                </div>
                <span className="text-[10px] text-slate-400">admin@platform.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('client@acme.com', 'Client@123456')}
                className="text-left px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs font-medium text-slate-700"
              >
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Client Admin (Acme)</span>
                </div>
                <span className="text-[10px] text-slate-400">client@acme.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('agent@acme.com', 'Agent@123456')}
                className="text-left px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs font-medium text-slate-700"
              >
                <div className="flex items-center space-x-2">
                  <Headphones className="w-4 h-4 text-teal-600" />
                  <span>Support Agent</span>
                </div>
                <span className="text-[10px] text-slate-400">agent@acme.com</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Need a new workspace?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
              Create Client Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

