import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Send,
  CheckCheck,
  Eye,
  Users,
  PlugZap,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  MessageSquare,
  PhoneCall,
  Film,
  Bot,
  UserCheck,
  Search,
  QrCode,
  FolderClosed,
  Ticket,
  LayoutGrid,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardOverview: React.FC = () => {
  const { user, currentOrg } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [metaStatus, setMetaStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'launcher' | 'analytics'>('launcher');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Format current time like "03:32 PM"
    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    );

    const fetchData = async () => {
      try {
        const [analyticsRes, statusRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/meta/status'),
        ]);
        setAnalytics(analyticsRes.data);
        setMetaStatus(statusRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    deliveryRate: 100,
    readRate: 0,
  };

  const appIcons = [
    {
      id: 'chats',
      title: 'Chats',
      icon: MessageSquare,
      path: '/app/inbox',
      bgColor: 'bg-sky-100 text-sky-600',
    },
    {
      id: 'calls',
      title: 'Calls',
      icon: PhoneCall,
      path: '/app/inbox',
      bgColor: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'contacts',
      title: 'Contacts',
      icon: Users,
      path: '/app/contacts',
      bgColor: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'broadcasts',
      title: 'Broadcasts',
      icon: Send,
      path: '/app/campaigns',
      bgColor: 'bg-rose-100 text-rose-500',
    },
    {
      id: 'media',
      title: 'Media',
      icon: Film,
      path: '/app/templates',
      bgColor: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'users',
      title: 'Users',
      icon: UserCheck,
      path: '/app/team',
      bgColor: 'bg-yellow-100 text-yellow-700',
    },
    {
      id: 'bots',
      title: 'Bots',
      icon: Bot,
      path: '/app/templates',
      bgColor: 'bg-purple-100 text-purple-600',
    },
  ];

  const filteredApps = appIcons.filter((app) =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('launcher')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'launcher'
                ? 'bg-[#0F172A] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>App Launcher & Hub</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'analytics'
                ? 'bg-[#059669] text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Platform Analytics</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 self-end sm:self-auto">
          <span>Active Organization:</span>
          <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            {currentOrg?.name || 'My Organization'}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: QUICK APP LAUNCHER & HUB (EXACT MATCH TO USER SCREENSHOT) */}
      {/* ============================================================== */}
      {activeTab === 'launcher' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Clean App Launcher Grid */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Organization Header Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentOrg?.name || 'My Dreams Technology'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">Official WhatsApp Cloud SaaS Platform</p>
              </div>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto mb-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Apps and Integrations"
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white shadow-2xs transition-all"
                />
              </div>

              {/* Tabs: Applications / Events */}
              <div className="flex items-center space-x-6 border-b border-slate-100 mb-8 max-w-xl mx-auto px-2">
                <button className="pb-2.5 text-xs font-bold text-emerald-600 border-b-2 border-emerald-500">
                  Applications
                </button>
                <button className="pb-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600">
                  Events & Triggers
                </button>
              </div>

              {/* Circular Apps Icons Grid (from Image 1) */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 sm:gap-8 max-w-2xl mx-auto">
                {filteredApps.map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => navigate(app.path)}
                      className="flex flex-col items-center group transition-transform hover:-translate-y-1 focus:outline-none"
                    >
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2.5 shadow-sm transition-all group-hover:shadow-md ${app.bgColor}`}
                      >
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600">
                        {app.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => alert('Support Desk: help@platform.com\nWhatsApp Support: +1 (555) 019-9000')}
                className="px-4 py-2 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Need Help?</span>
              </button>

              <div className="text-xs text-slate-400">
                <span>Version 2.4.0 • Meta Graph API v20.0</span>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): User Header & Info Cards (from Image 1) */}
          <div className="lg:col-span-4 space-y-4">
            {/* User Greeting & Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hey !
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[11px] font-mono text-slate-500">
                    Login : {currentTime || '03:32 PM'}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {user?.isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
              </div>

              {/* User Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#0F172A] flex items-center justify-center text-emerald-400 font-bold text-base shadow-sm ring-2 ring-slate-100">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            </div>

            {/* Card 1: WhatsApp Connected Card (Light Green #DCFCE7) */}
            <div className="bg-[#DCFCE7] border border-emerald-300/80 rounded-3xl p-5 text-emerald-950 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>WhatsApp Connected</span>
                </div>
                <div className="mt-1 flex items-center space-x-1 text-sm font-extrabold text-emerald-900 font-mono">
                  <span>{metaStatus?.phone?.displayPhoneNumber || '918883333308'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-800">
                <QrCode className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Available Conv. Balance (Light Peach #FFEDD5) */}
            <div className="bg-[#FFEDD5] border border-amber-300/80 rounded-3xl p-5 text-amber-950 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-800">
                  <FolderClosed className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Available Conv. Balance
                  </div>
                  <div className="text-xl font-extrabold text-amber-900 font-mono mt-0.5">
                    3,040
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-white/70 px-2.5 py-1 rounded-xl">
                Active
              </span>
            </div>

            {/* Card 3: Billing Plan & Validity (Light Cyan #CFFAFE) */}
            <div className="bg-[#CFFAFE] border border-cyan-300/80 rounded-3xl p-5 text-cyan-950 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-800">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider">
                    Billing Plan: Yearly
                  </div>
                  <div className="text-xs font-mono text-cyan-900 font-bold mt-0.5">
                    Valid Till: 15-11-2026
                  </div>
                </div>
              </div>
              <Link
                to="/app/billing"
                className="text-xs font-bold text-cyan-800 hover:underline flex items-center space-x-0.5"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Connected Accounts (Light Yellow #FEF3C7) */}
            <div className="bg-[#FEF3C7] border border-yellow-300/80 rounded-3xl p-5 text-yellow-950 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-800">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-yellow-800 uppercase tracking-wider">
                    Connected Accounts
                  </div>
                  <div className="text-base font-extrabold text-yellow-900 mt-0.5">
                    1 account active
                  </div>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>

            {/* Card 5: Subscription Info at Bottom Right */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm text-xs text-slate-500 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Subscription Info.</span>
                </div>
                <div className="font-semibold text-slate-700 mt-0.5 uppercase tracking-wide">
                  {currentOrg?.name || 'K7 CHITFUNDS PVT LTD'}
                </div>
                <div className="font-mono text-[11px] text-slate-400">#40493644029</div>
              </div>
              <Link
                to="/app/billing"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DETAILED ANALYTICS, METRICS & IMPLEMENTATION ROADMAP   */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Banner / Welcome with Premium Luxury Gradient */}
          <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-slate-950 via-[#0B1528] to-[#06241E] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-slate-950/20 border border-slate-800/80">
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official WhatsApp Cloud API Engine</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                Platform Command Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/80 mt-1 max-w-xl leading-relaxed">
                Real-time delivery status, broadcast campaigns, and automated webhooks.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to="/app/templates"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors backdrop-blur-md border border-white/15 flex items-center justify-center space-x-1.5"
              >
                <span>Send Test Message</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/app/campaigns"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-1.5"
              >
                <span>Launch Campaign</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* WhatsApp Connection Status Banner (Mobile Responsive) */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  metaStatus?.connected
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}
              >
                <PlugZap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {metaStatus?.connected
                      ? `Connected: ${metaStatus.phone?.displayPhoneNumber || 'WhatsApp Account'}`
                      : 'WhatsApp Business Account Not Connected'}
                  </span>
                  <StatusBadge status={metaStatus?.connected ? 'CONNECTED' : 'DISCONNECTED'} />
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                  WABA ID:{' '}
                  <span className="font-mono text-slate-700">
                    {metaStatus?.account?.wabaId || 'None'}
                  </span>{' '}
                  • Phone ID:{' '}
                  <span className="font-mono text-slate-700">
                    {metaStatus?.phone?.phoneNumberId || 'None'}
                  </span>
                </p>
              </div>
            </div>

            <Link
              to="/app/connect"
              className="self-end sm:self-auto text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 shrink-0 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60"
            >
              <span>Manage Setup</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Key Metric Cards (Mobile Grid: 1 col on mobile, 2 on tablet, 4 on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Sent
                </span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics.sent}</div>
              <div className="text-xs text-slate-500 mt-1.5 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Messages dispatched</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Delivered
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <CheckCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {metrics.delivered}
              </div>
              <div className="text-xs text-emerald-600 font-bold mt-1.5">
                {metrics.deliveryRate}% delivery rate
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Read Receipts
                </span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {metrics.read}
              </div>
              <div className="text-xs text-teal-600 font-bold mt-1.5">
                {metrics.readRate}% open rate
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Opted-In Contacts
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {analytics?.optedInContacts || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1.5">
                {analytics?.totalContacts || 0} total saved contacts
              </div>
            </div>
          </div>

          {/* Roadmap & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-3 sm:mb-4">
                Implementation Roadmap Status
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                {[
                  {
                    day: 'Day 1-2',
                    label: 'NestJS app, MongoDB schema & health endpoints',
                    status: 'COMPLETED',
                  },
                  {
                    day: 'Day 3-4',
                    label: 'React multi-tenant dashboard & JWT auth',
                    status: 'COMPLETED',
                  },
                  {
                    day: 'Day 5-6',
                    label: 'Organizations, memberships & tenant isolation',
                    status: 'COMPLETED',
                  },
                  {
                    day: 'Day 7-8',
                    label: 'Meta developer app, WABA connection & webhooks',
                    status: 'COMPLETED',
                  },
                  {
                    day: 'Day 9-10',
                    label: 'Template sync, test template send & delivery tracking',
                    status: 'COMPLETED',
                  },
                  {
                    day: 'Day 11-15',
                    label: 'BullMQ queue, throttled broadcast campaigns & billing',
                    status: 'COMPLETED',
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 gap-2"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        {step.day}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-slate-700 leading-snug">
                        {step.label}
                      </span>
                    </div>
                    <StatusBadge status={step.status} className="self-start sm:self-auto" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Quick Actions</h3>
                <p className="text-xs text-slate-500 mb-4">Perform common WhatsApp operations</p>

                <div className="space-y-2.5">
                  <Link
                    to="/app/templates"
                    className="w-full text-left p-3 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-slate-700"
                  >
                    <span>Send Test WhatsApp Message</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/app/contacts"
                    className="w-full text-left p-3 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-slate-700"
                  >
                    <span>Import Contacts with Consent (CSV)</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/app/inbox"
                    className="w-full text-left p-3 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-slate-700"
                  >
                    <span>Open Live 2-Way Chat Inbox</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Workspace Plan</span>
                <span className="font-bold text-slate-800 uppercase px-2 py-0.5 rounded bg-slate-100 text-[10px]">
                  Pro Tier
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
