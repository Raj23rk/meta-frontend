import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Shield,
  Building2,
  Plus,
  ArrowRight,
  Power,
  Users,
  MessageSquare,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Key,
  Mail,
  Share2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { switchOrganization } = useAuth();
  const navigate = useNavigate();

  // Create Client Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('Client@123456');
  const [plan, setPlan] = useState('starter');
  const [monthlyQuota, setMonthlyQuota] = useState(10000);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Share Credentials Modal State
  const [createdCredentials, setCreatedCredentials] = useState<{
    companyName: string;
    adminName: string;
    email: string;
    password: string;
    plan: string;
    loginUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await api.get('/organizations');
      setOrganizations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClientAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      // Provision Client Workspace & Client Admin user account
      const res = await api.post('/auth/register', {
        name: adminName,
        companyName,
        email: adminEmail,
        password: adminPassword,
      });

      const createdOrg = res.data.organizations?.[0] || res.data.defaultOrganization;

      // Update plan/quota if non-starter
      if (createdOrg?.id && (plan !== 'starter' || monthlyQuota !== 10000)) {
        await api.patch(`/organizations/${createdOrg.id}`, {
          plan,
          settings: {
            monthlyQuota: Number(monthlyQuota),
            currentMonthUsage: 0,
            wabaConnected: false,
          },
        });
      }

      setShowCreateModal(false);

      // Open credentials sharing modal
      setCreatedCredentials({
        companyName,
        adminName,
        email: adminEmail,
        password: adminPassword,
        plan,
        loginUrl: `${window.location.origin}/login`,
      });

      // Reset Form
      setCompanyName('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('Client@123456');
      setPlan('starter');
      setMonthlyQuota(10000);

      fetchOrganizations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to provision client account. Ensure email is unique.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const textToCopy = `🔐 WhatsApp Business SaaS - Your Client Workspace Access

🏢 Workspace: ${createdCredentials.companyName}
👤 Admin: ${createdCredentials.adminName}
🔗 Login Portal: ${createdCredentials.loginUrl}
✉️ Email: ${createdCredentials.email}
🔑 Password: ${createdCredentials.password}

Please sign in and configure your Meta WhatsApp Cloud API credentials.`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleStatus = async (org: any) => {
    const newStatus = org.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/organizations/${org.id}`, { status: newStatus });
      fetchOrganizations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnterWorkspace = (org: any) => {
    switchOrganization(org.id);
    navigate('/app');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeCount = organizations.filter((o) => o.status === 'active').length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B0F19] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/20 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <span>Super Admin Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Platform Tenant Control</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Admin-only client account creation. Provision workspaces and share credentials with clients.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setError('');
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Client Account</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Client Tenants</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{organizations.length}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Businesses</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{activeCount}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Suspended Tenants</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{organizations.length - activeCount}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Power className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Client Accounts Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Registered Client Organizations</h2>
            <p className="text-xs text-slate-500">Only Super Admins can provision clients and assign their administrators.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 sm:px-6">Tenant / Brand</th>
                <th className="py-3 px-4 sm:px-6">Plan</th>
                <th className="py-3 px-4 sm:px-6">Quota Usage</th>
                <th className="py-3 px-4 sm:px-6">Meta WABA Status</th>
                <th className="py-3 px-4 sm:px-6">Status</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{org.name}</span>
                        <span className="text-[10px] text-slate-400">ID: {org.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 capitalize">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      {org.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <div>
                      <span>
                        {(org.settings?.currentMonthUsage || 0).toLocaleString()} / {(org.settings?.monthlyQuota || 10000).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    {org.wabaConnected ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Not Connected</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <StatusBadge status={org.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(org)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                        org.status === 'active'
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {org.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEnterWorkspace(org)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                    >
                      <span>Enter</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Client Account Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create & Provision Client Account"
        >
          <form onSubmit={handleCreateClientAccount} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Workspace Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Retail Global"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client Admin Full Name</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client Admin Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Initial Password (To Share with Client)</label>
                <button
                  type="button"
                  onClick={() => setAdminPassword(`Pass@${Math.floor(100000 + Math.random() * 900000)}`)}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  Generate Random
                </button>
              </div>
              <input
                type="text"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Client@123456"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
                >
                  <option value="starter">Starter (10k msgs)</option>
                  <option value="pro">Pro (25k msgs)</option>
                  <option value="enterprise">Enterprise (100k msgs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Message Quota</label>
                <input
                  type="number"
                  required
                  value={monthlyQuota}
                  onChange={(e) => setMonthlyQuota(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                {creating ? 'Provisioning Account...' : 'Create Account & Generate Credentials'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Share Credentials Success Modal */}
      {createdCredentials && (
        <Modal
          isOpen={!!createdCredentials}
          onClose={() => setCreatedCredentials(null)}
          title="Client Account Created - Share Credentials"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Client workspace <strong>{createdCredentials.companyName}</strong> has been provisioned. Share these credentials with the client user.
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-sans">Login Portal:</span>
                <span className="text-indigo-600 font-semibold">{createdCredentials.loginUrl}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-sans">Client Email:</span>
                <span className="text-slate-900 font-bold">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-sans">Password:</span>
                <span className="text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                  {createdCredentials.password}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-sans">Assigned Role:</span>
                <span className="text-slate-700 font-sans font-semibold">Client Admin</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials to Share'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
