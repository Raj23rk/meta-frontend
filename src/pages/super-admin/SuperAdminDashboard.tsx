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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { switchOrganization } = useAuth();
  const navigate = useNavigate();

  // Create Client Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('starter');
  const [monthlyQuota, setMonthlyQuota] = useState(10000);
  const [creating, setCreating] = useState(false);

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

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/organizations', { name, plan, monthlyQuota: Number(monthlyQuota) });
      setShowCreateModal(false);
      setName('');
      fetchOrganizations();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
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
      {/* Header with Dark Luxury Obsidian Styling */}
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
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Client Tenant</span>
        </button>
      </div>

      {/* Global Platform Counters (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Client Workspaces</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{organizations.length}</div>
          <div className="text-xs text-emerald-600 font-bold mt-1.5">
            {activeCount} active tenants
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Platform Status</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 flex items-center space-x-2">
            <span>Healthy</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-xs text-slate-500 mt-1.5">All microservices responding</div>
        </div>

        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tenant Isolation</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">Enforced</div>
          <div className="text-xs text-slate-500 mt-1.5">Role guards + Organization queries</div>
        </div>
      </div>

      {/* Tenants Table (Responsive Horizontal Scroll) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Client Workspaces ({organizations.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Company / Workspace Name</th>
                <th className="py-3.5 px-4 sm:px-6">Plan</th>
                <th className="py-3.5 px-4 sm:px-6">WhatsApp WABA</th>
                <th className="py-3.5 px-4 sm:px-6">Contacts</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="font-bold text-slate-900">{org.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{org.id}</div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-700 uppercase">
                    {org.plan}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <StatusBadge status={org.wabaConnected ? 'CONNECTED' : 'DISCONNECTED'} />
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800">{org.contactsCount || 0}</td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <StatusBadge status={org.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(org)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        org.status === 'active'
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {org.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleEnterWorkspace(org)}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors inline-flex items-center space-x-1"
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

      {/* Provision Client Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Provision New Client Tenant"
        >
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Client Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zenith Logistics Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              >
                <option value="starter">Starter (10,000 msgs/mo)</option>
                <option value="pro">Pro (25,000 msgs/mo)</option>
                <option value="enterprise">Enterprise (100,000 msgs/mo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Message Quota</label>
              <input
                type="number"
                required
                value={monthlyQuota}
                onChange={(e) => setMonthlyQuota(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                {creating ? 'Creating...' : 'Provision Client'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
