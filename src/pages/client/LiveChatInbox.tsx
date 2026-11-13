import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  MessagesSquare,
  Send,
  Search,
  Check,
  CheckCheck,
  User,
  Bot,
  Sparkles,
  Phone,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

export const LiveChatInbox: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  // Mobile view state: 'list' or 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Simulator state
  const [simText, setSimText] = useState('Hi! I need help with my recent order delivery.');
  const [simulating, setSimulating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.contactId);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
      if (res.data.length > 0 && !selectedContact && window.innerWidth >= 768) {
        setSelectedContact(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const res = await api.get(`/conversations/${contactId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectContact = (conv: any) => {
    setSelectedContact(conv);
    setMobileView('chat');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedContact) return;
    setSending(true);
    try {
      await api.post(`/conversations/${selectedContact.contactId}/reply`, { text: replyText });
      setReplyText('');
      fetchMessages(selectedContact.contactId);
      fetchConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleSimulateInbound = async () => {
    if (!selectedContact) return;
    setSimulating(true);
    try {
      await api.post('/webhooks/simulate', {
        eventType: 'inbound_reply',
        senderPhone: selectedContact.contact?.phone || '15552345678',
        replyText: simText,
      });
      setTimeout(() => {
        fetchMessages(selectedContact.contactId);
        fetchConversations();
      }, 500);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filtered = conversations.filter(
    (c) =>
      c.contact?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact?.phone?.includes(search),
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Two-Way Live Chat Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time customer WhatsApp messages, delivery receipts, and agent replies.
          </p>
        </div>

        <button
          onClick={() => {
            fetchConversations();
            if (selectedContact) fetchMessages(selectedContact.contactId);
          }}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          title="Refresh Messages"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Chat Layout Container (Responsive on mobile: toggles between list & chat) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex h-[640px] sm:h-[720px]">
        {/* Left: Conversations Thread List (Hidden on mobile if chat is active) */}
        <div
          className={`${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 border-r border-slate-200 flex-col shrink-0 bg-slate-50/50`}
        >
          <div className="p-3 sm:p-3.5 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((conv) => {
              const isSelected = selectedContact?.contactId === conv.contactId;
              return (
                <button
                  key={conv.contactId}
                  onClick={() => handleSelectContact(conv)}
                  className={`w-full text-left p-3.5 sm:p-4 flex items-start space-x-3 transition-colors ${
                    isSelected ? 'bg-emerald-50/80 border-r-2 border-emerald-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                    {conv.contact?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {conv.contact?.name || 'Customer'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.latestMessage?.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mb-1 truncate">
                      {conv.contact?.phone}
                    </div>
                    <p className="text-xs text-slate-600 truncate">
                      {conv.latestMessage?.direction === 'outbound' && 'You: '}
                      {conv.latestMessage?.content}
                    </p>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">No active conversations found</div>
            )}
          </div>
        </div>

        {/* Right: Selected Chat Timeline (Hidden on mobile if list is active) */}
        {selectedContact ? (
          <div
            className={`${
              mobileView === 'list' ? 'hidden md:flex' : 'flex'
            } flex-1 flex-col bg-[#EFEAE2]/35 min-w-0`}
          >
            {/* Chat Header */}
            <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                  {selectedContact.contact?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {selectedContact.contact?.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{selectedContact.contact?.phone}</span>
                    {selectedContact.contact?.optOut && (
                      <span className="text-rose-600 font-sans font-semibold text-[9px] bg-rose-50 px-1.5 py-0.2 rounded">
                        Opted-Out
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Developer Webhook Simulation Trigger */}
              <div className="flex items-center space-x-1.5 w-full sm:w-auto mt-1 sm:mt-0">
                <input
                  type="text"
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder="Simulate customer reply..."
                  className="flex-1 sm:w-44 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSimulateInbound}
                  disabled={simulating}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold flex items-center space-x-1 shadow-sm shrink-0"
                >
                  <Bot className="w-3 h-3" />
                  <span className="hidden sm:inline">Simulate Reply</span>
                  <span className="sm:hidden">Reply</span>
                </button>
              </div>
            </div>

            {/* Message Bubble Timeline */}
            <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-3">
              {messages.map((msg) => {
                const isOutbound = msg.direction === 'outbound';
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 sm:p-3.5 shadow-sm text-xs leading-relaxed relative ${
                        isOutbound
                          ? 'bg-[#D9FDD3] text-slate-900 rounded-tr-none'
                          : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/60'
                      }`}
                    >
                      {msg.templateName && (
                        <div className="text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                          Template: {msg.templateName}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] sm:text-[10px] text-slate-400">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isOutbound && (
                          <span>
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Box */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendReply} className="flex items-center space-x-2 sm:space-x-3">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    selectedContact.contact?.optOut
                      ? 'Contact has opted out of WhatsApp messages'
                      : 'Type WhatsApp reply...'
                  }
                  disabled={selectedContact.contact?.optOut || sending}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={selectedContact.contact?.optOut || sending}
                  className="py-2 sm:py-2.5 px-3.5 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center space-x-1 shadow-md shadow-emerald-600/20 disabled:opacity-50 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-slate-400 text-xs sm:text-sm">
            Select a conversation on the left to start chatting
          </div>
        )}
      </div>
    </div>
  );
};
