import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  SendHorizontal,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  CheckCheck,
  AlertCircle,
  Users,
} from 'lucide-react';

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Campaign Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [audienceType, setAudienceType] = useState<'all' | 'tags'>('all');
  const [selectedTag, setSelectedTag] = useState('vip');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // View Campaign Modal
  const [viewCampaign, setViewCampaign] = useState<any>(null);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates');
      setTemplates(res.data);
      if (res.data.length > 0) {
        setTemplateId(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/campaigns', {
        name,
        templateId,
        audienceType,
        targetTags: audienceType === 'tags' ? [selectedTag] : [],
      });
      setShowCreateModal(false);
      setName('');
      fetchCampaigns();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await api.post(`/campaigns/${id}/start`);
      fetchCampaigns();
      const interval = setInterval(fetchCampaigns, 1000);
      setTimeout(() => clearInterval(interval), 6000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await api.post(`/campaigns/${id}/pause`);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResume = async (id: string) => {
    try {
      await api.post(`/campaigns/${id}/resume`);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.post(`/campaigns/${id}/cancel`);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDetails = async (id: string) => {
    try {
      const res = await api.get(`/campaigns/${id}`);
      setViewCampaign(res.data);
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Broadcast Campaigns</h1>
          <p className="text-xs text-slate-500 mt-1">
            Send bulk WhatsApp messages to opted-in audiences with queue throttling and rate controls.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5">
        {campaigns.map((camp) => {
          const total = camp.counters?.total || 0;
          const sent = camp.counters?.sent || 0;
          const delivered = camp.counters?.delivered || 0;
          const read = camp.counters?.read || 0;
          const percent = total > 0 ? Math.round((sent / total) * 100) : 0;

          return (
            <div
              key={camp._id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{camp.name}</h3>
                    <StatusBadge status={camp.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Template: <strong className="text-slate-700 font-mono">{camp.templateId?.name || 'Template'}</strong></span>
                    <span>•</span>
                    <span>Audience: <strong className="text-slate-700 uppercase">{camp.audienceType}</strong></span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {['draft', 'paused'].includes(camp.status) && (
                    <button
                      onClick={() => (camp.status === 'paused' ? handleResume(camp._id) : handleStart(camp._id))}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center space-x-1 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{camp.status === 'paused' ? 'Resume' : 'Start Queue'}</span>
                    </button>
                  )}

                  {['queued', 'processing'].includes(camp.status) && (
                    <button
                      onClick={() => handlePause(camp._id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors flex items-center space-x-1 shadow-sm"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                  )}

                  {!['completed', 'cancelled'].includes(camp.status) && (
                    <button
                      onClick={() => handleCancel(camp._id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors flex items-center space-x-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenDetails(camp._id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>

              {/* Progress and Counters (Responsive Grid: 2 cols on mobile, 4 on desktop) */}
              <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1 font-semibold">
                    <span>Progress</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-semibold text-[10px] uppercase">Total</div>
                    <div className="font-bold text-slate-800 text-sm sm:text-base">{total}</div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                    <div className="text-sky-600 font-semibold text-[10px] uppercase">Sent</div>
                    <div className="font-bold text-sky-800 text-sm sm:text-base">{sent}</div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="text-emerald-600 font-semibold text-[10px] uppercase">Delivered</div>
                    <div className="font-bold text-emerald-800 text-sm sm:text-base">{delivered}</div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-teal-50 border border-teal-100">
                    <div className="text-teal-600 font-semibold text-[10px] uppercase">Read</div>
                    <div className="font-bold text-teal-800 text-sm sm:text-base">{read}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {campaigns.length === 0 && (
          <div className="p-10 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200">
            <SendHorizontal className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700">No campaigns launched yet</h4>
            <p className="text-xs text-slate-400 mt-1">Create your first campaign to broadcast to opted-in contacts.</p>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Broadcast Campaign"
        >
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {createError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. VIP Summer Sale 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Template</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.category} • {t.language})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Audience Filter</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                <button
                  type="button"
                  onClick={() => setAudienceType('all')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    audienceType === 'all'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  All Opted-In Contacts
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceType('tags')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    audienceType === 'tags'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  By Specific Tag
                </button>
              </div>

              {audienceType === 'tags' && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Select Target Tag</label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  >
                    <option value="vip">vip</option>
                    <option value="retail">retail</option>
                    <option value="wholesale">wholesale</option>
                    <option value="lead">lead</option>
                  </select>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
              Note: Contacts who have opted out will be automatically excluded by the queue worker.
            </div>

            <div className="flex justify-end space-x-3 pt-2">
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
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
              >
                {creating ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Campaign Details Modal */}
      {viewCampaign && (
        <Modal
          isOpen={!!viewCampaign}
          onClose={() => setViewCampaign(null)}
          title={`Campaign Details: ${viewCampaign.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-2">
              <div className="text-xs">
                <span className="text-slate-500">Status: </span>
                <StatusBadge status={viewCampaign.status} />
              </div>
              <div className="text-xs text-slate-500">
                Template: <strong className="text-slate-800">{viewCampaign.templateId?.name}</strong>
              </div>
            </div>

            <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Recipients List</h4>
            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
              {viewCampaign.recipients?.map((rec: any) => (
                <div key={rec._id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{rec.contactId?.name || rec.phone}</div>
                    <div className="font-mono text-[10px] text-slate-400">{rec.phone}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={rec.status} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewCampaign(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
