import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Users, UserPlus, Trash2, Mail, Shield, Headphones, Copy, Check, CheckCircle2 } from 'lucide-react';

export const TeamMembers: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('agent');
  const [password, setPassword] = useState('Welcome@123');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Share Credentials Modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
    loginUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/memberships');
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/memberships', { name, email, role, password });
      setShowInviteModal(false);

      // Open credentials share modal
      setCreatedCredentials({
        name,
        email,
        password,
        role: role === 'client_admin' ? 'Client Admin' : 'Support Agent',
        loginUrl: `${window.location.origin}/login`,
      });

      setName('');
      setEmail('');
      setPassword('Welcome@123');
      fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const textToCopy = `🔐 WhatsApp Business Workspace - Your Login Credentials

👤 Name: ${createdCredentials.name}
💼 Role: ${createdCredentials.role}
🔗 Login Portal: ${createdCredentials.loginUrl}
✉️ Email: ${createdCredentials.email}
🔑 Password: ${createdCredentials.password}

Please sign in to access your assigned WhatsApp workspace.`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await api.delete(`/memberships/${id}`);
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Team Members & Access</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create user accounts and share credentials with your agents and operators.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setShowInviteModal(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[560px]">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Name</th>
                <th className="py-3.5 px-4 sm:px-6">Email</th>
                <th className="py-3.5 px-4 sm:px-6">Role</th>
                <th className="py-3.5 px-4 sm:px-6">Joined Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                      {member.user?.name?.charAt(0) || 'U'}
                    </div>
                    <span>{member.user?.name || 'Unknown User'}</span>
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-slate-500">{member.user?.email}</td>
                  <td className="py-3 px-4 sm:px-6">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        member.role === 'client_admin'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                      }`}
                    >
                      {member.role === 'client_admin' ? (
                        <>
                          <Shield className="w-3 h-3 text-indigo-600" />
                          <span>Client Admin</span>
                        </>
                      ) : (
                        <>
                          <Headphones className="w-3 h-3 text-emerald-600" />
                          <span>Support Agent</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-slate-400">
                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Active'}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-right">
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Team Member Modal */}
      {showInviteModal && (
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Add New Team Member"
        >
          <form onSubmit={handleAddMember} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Workspace Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="agent">Agent (Live Chat Inbox & Contact Management)</option>
                <option value="client_admin">Client Admin (Full Workspace Access & Campaigns)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Initial Password (Share with User)</label>
                <button
                  type="button"
                  onClick={() => setPassword(`User@${Math.floor(100000 + Math.random() * 900000)}`)}
                  className="text-[11px] font-semibold text-emerald-600 hover:underline"
                >
                  Generate Random
                </button>
              </div>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Welcome@123"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
              >
                {saving ? 'Creating Account...' : 'Create Account & Generate Credentials'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Share Team Member Credentials Modal */}
      {createdCredentials && (
        <Modal
          isOpen={!!createdCredentials}
          onClose={() => setCreatedCredentials(null)}
          title="Team Member Added - Share Credentials"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                User account for <strong>{createdCredentials.name}</strong> created. Share these credentials with the user so they can sign in.
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-sans">Login Portal:</span>
                <span className="text-emerald-700 font-semibold">{createdCredentials.loginUrl}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-sans">User Email:</span>
                <span className="text-slate-900 font-bold">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-sans">Password:</span>
                <span className="text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                  {createdCredentials.password}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-sans">Role:</span>
                <span className="text-slate-700 font-sans font-semibold">{createdCredentials.role}</span>
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
