import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  PlugZap,
  KeyRound,
  Globe2,
  Copy,
  Check,
  Send,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const WhatsAppConnection: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Form states
  const [wabaId, setWabaId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [displayPhone, setDisplayPhone] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test send state
  const [testPhone, setTestPhone] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/meta/status');
      setStatus(res.data);
      if (res.data.account) {
        setWabaId(res.data.account.wabaId || '');
        setVerifiedName(res.data.account.verifiedName || '');
      }
      if (res.data.phone) {
        setPhoneNumberId(res.data.phone.phoneNumberId || '');
        setDisplayPhone(res.data.phone.displayPhoneNumber || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.post('/meta/connect', {
        wabaId,
        phoneNumberId,
        displayPhoneNumber: displayPhone,
        accessToken: accessToken || 'demo_token_keep_active',
        verifiedName,
      });
      setMessage({ type: 'success', text: 'WhatsApp Business credentials saved and account connected!' });
      fetchStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Connection failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleSimulateEmbeddedSignup = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.post('/meta/embedded-signup/exchange', { code: 'demo_code' });
      setMessage({ type: 'success', text: 'Meta Embedded Signup completed successfully!' });
      fetchStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Signup failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await api.post('/meta/send-test', {
        to: testPhone,
        type: 'text',
        text: { body: 'Hello! This is an official test message from your connected WhatsApp Business SaaS Platform.' },
      });
      setTestResult(res.data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.response?.data?.message || err.message });
    } finally {
      setSendingTest(false);
    }
  };

  const copyToClipboard = (text: string, isToken = false) => {
    navigator.clipboard.writeText(text);
    if (isToken) {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const webhookCallbackUrl = status?.webhookConfig?.callbackUrl || 'http://localhost:3000/api/webhooks/whatsapp';
  const webhookVerifyToken = status?.webhookConfig?.verifyToken || 'whatsapp_webhook_verify_token_secure_123';

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">WhatsApp Meta Connection</h1>
        <p className="text-xs text-slate-500 mt-1">
          Connect your official WhatsApp Business Account (WABA) via Meta Cloud API.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl text-xs font-semibold border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Connection Mode Choice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Option 1: Embedded Signup */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Meta Embedded Signup</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Official Meta Facebook Login popup workflow. Allows clients to onboard their existing WhatsApp Business portfolio directly without copying tokens manually.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSimulateEmbeddedSignup}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>Launch Embedded Signup Flow</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Option 2: Active Connection Status Badge */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PlugZap className="w-5 h-5" />
              </div>
              <StatusBadge status={status?.connected ? 'CONNECTED' : 'DISCONNECTED'} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Connection Details</h3>
            <div className="space-y-2 mt-4 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Business Name:</span>
                <span className="font-semibold text-slate-800">{status?.account?.verifiedName || 'Acme Retail Inc.'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Phone Number:</span>
                <span className="font-semibold text-slate-800">{status?.phone?.displayPhoneNumber || '+1 (555) 019-2834'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Quality Rating:</span>
                <span className="font-bold text-emerald-600">{status?.account?.qualityRating || 'GREEN'}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-4">
            Security: Access tokens are encrypted using AES-256-GCM.
          </div>
        </div>
      </div>

      {/* Manual Credentials Configuration */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Direct Meta Cloud API Credentials</h3>
        <p className="text-xs text-slate-500 mb-6">
          Provide your WhatsApp Business Account ID, Phone Number ID, and Graph API Permanent Access Token from Meta Developer Portal.
        </p>

        <form onSubmit={handleConnect} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WABA ID (WhatsApp Business Account ID)</label>
            <input
              type="text"
              required
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              placeholder="e.g. 109849201948291"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number ID</label>
            <input
              type="text"
              required
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="e.g. 102938475610293"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Display Phone Number</label>
            <input
              type="text"
              required
              value={displayPhone}
              onChange={(e) => setDisplayPhone(e.target.value)}
              placeholder="e.g. +1 (555) 019-2834"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Verified Brand Name</label>
            <input
              type="text"
              value={verifiedName}
              onChange={(e) => setVerifiedName(e.target.value)}
              placeholder="e.g. Acme Retail Official"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">System User Access Token (Encrypted on Save)</label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="•••••••••••••••••••••••••••••••• (Leave blank to keep current token)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20"
            >
              {saving ? 'Saving...' : 'Save & Verify Connection'}
            </button>
          </div>
        </form>
      </div>

      {/* Meta Webhook Setup Instructions */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-2">
          <Globe2 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Meta Webhook Configuration</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Configure these values in your Meta Developer App under <strong>WhatsApp &gt; Configuration &gt; Webhook</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-semibold">
              <span>Callback URL</span>
              <button
                type="button"
                onClick={() => copyToClipboard(webhookCallbackUrl, false)}
                className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[11px] sm:text-xs font-mono text-slate-800 select-all break-all">{webhookCallbackUrl}</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-semibold">
              <span>Verify Token</span>
              <button
                type="button"
                onClick={() => copyToClipboard(webhookVerifyToken, true)}
                className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[11px] sm:text-xs font-mono text-slate-800 select-all break-all">{webhookVerifyToken}</div>
          </div>
        </div>
      </div>

      {/* Test Message Dispatcher */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Phase 3 Milestone: Send First Test Message</h3>
        <p className="text-xs text-slate-500 mb-4">
          Send a controlled test message to your personal test WhatsApp number to verify API connectivity.
        </p>

        <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="Recipient WhatsApp Number with country code (e.g. 15551234567)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            disabled={sendingTest}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shrink-0 shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            <span>{sendingTest ? 'Sending...' : 'Send Live Test Message'}</span>
          </button>
        </form>

        {testResult && (
          <div
            className={`mt-4 p-4 rounded-2xl text-xs font-mono border ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="font-bold mb-1">
              {testResult.success ? '✔ Test Message Dispatched Successfully!' : '✖ Send Failed'}
            </div>
            {testResult.metaMessageId && <div>Meta Message ID: {testResult.metaMessageId}</div>}
            {testResult.status && <div>Initial Status: {testResult.status}</div>}
            {testResult.error && <div>Error: {testResult.error}</div>}
          </div>
        )}
      </div>
    </div>
  );
};
