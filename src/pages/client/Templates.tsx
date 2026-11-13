import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  FileCode2,
  RefreshCw,
  Plus,
  Send,
  MessageSquare,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Video,
  FileText,
  MapPin,
  Smile,
  Bold,
  Italic,
  Strikethrough,
  Code,
  ArrowLeft,
  ArrowRight,
  Upload,
  Trash2,
  Phone,
  ExternalLink,
  ShieldCheck,
  Check,
  HelpCircle,
  X,
} from 'lucide-react';

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  // Creation Wizard Modal State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Step 1: Category & Subcategory
  const [category, setCategory] = useState<'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('MARKETING');
  const [subCategory, setSubCategory] = useState('CUSTOM');

  // Step 2: Name & Languages
  const [templateName, setTemplateName] = useState('');
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [newLangInput, setNewLangInput] = useState('');

  // Step 3: Edit Template Content
  const [headerType, setHeaderType] = useState<'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION'>('NONE');
  const [headerText, setHeaderText] = useState('');
  const [headerMediaUrl, setHeaderMediaUrl] = useState('');
  const [headerMediaName, setHeaderMediaName] = useState('');
  const [bodyText, setBodyText] = useState('Hello {{1}}, thank you for your order! Your tracking number is {{2}}.');
  const [footerText, setFooterText] = useState('Reply STOP to unsubscribe');
  const [buttons, setButtons] = useState<
    Array<{ type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'OPT_OUT'; text: string; url?: string; phoneNumber?: string }>
  >([
    { type: 'OPT_OUT', text: 'STOP' },
    { type: 'URL', text: 'Visit Website', url: 'https://example.com' },
  ]);
  const [showAddButtonDropdown, setShowAddButtonDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wizardError, setWizardError] = useState('');

  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Send Test Modal
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [testPhone, setTestPhone] = useState('');
  const [var1, setVar1] = useState('Valued Customer');
  const [var2, setVar2] = useState('ORD-9021');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/meta/sync-templates');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const openNewWizard = () => {
    setWizardStep(1);
    setCategory('MARKETING');
    setSubCategory('CUSTOM');
    setTemplateName('');
    setLanguages(['English']);
    setHeaderType('NONE');
    setHeaderText('');
    setHeaderMediaUrl('');
    setHeaderMediaName('');
    setBodyText('Hello {{1}}, thank you for your order! Your tracking number is {{2}}.');
    setFooterText('Reply STOP to unsubscribe');
    setButtons([
      { type: 'OPT_OUT', text: 'STOP' },
      { type: 'URL', text: 'Visit Website', url: 'https://example.com' },
    ]);
    setWizardError('');
    setShowWizard(true);
  };

  // Step 2 Language add/remove
  const handleAddLanguage = (lang: string) => {
    if (lang && !languages.includes(lang)) {
      setLanguages([...languages, lang]);
      setNewLangInput('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    if (languages.length > 1) {
      setLanguages(languages.filter((l) => l !== lang));
    }
  };

  // Image / Media file upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeaderMediaName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Body formatting helper functions
  const insertFormatting = (prefix: string, suffix: string) => {
    const textarea = bodyTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = bodyText.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newText = bodyText.substring(0, start) + replacement + bodyText.substring(end);
    setBodyText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 50);
  };

  // Auto Add Variable button
  const handleAddVariable = () => {
    const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
    const nextVar = matches.length + 1;
    const textarea = bodyTextareaRef.current;
    if (!textarea) {
      setBodyText(bodyText + ` {{${nextVar}}}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = bodyText.substring(0, start) + `{{${nextVar}}}` + bodyText.substring(end);
    setBodyText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + `{{${nextVar}}}`.length, start + `{{${nextVar}}}`.length);
    }, 50);
  };

  // Button management
  const handleAddButton = (type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'OPT_OUT') => {
    setShowAddButtonDropdown(false);
    if (type === 'OPT_OUT') {
      if (!buttons.some((b) => b.type === 'OPT_OUT')) {
        setButtons([...buttons, { type: 'OPT_OUT', text: 'STOP' }]);
      }
    } else if (type === 'URL') {
      setButtons([...buttons, { type: 'URL', text: 'Visit Website', url: 'https://' }]);
    } else if (type === 'PHONE_NUMBER') {
      setButtons([...buttons, { type: 'PHONE_NUMBER', text: 'Call Us', phoneNumber: '+1 ' }]);
    } else {
      setButtons([...buttons, { type: 'QUICK_REPLY', text: `Reply Option ${buttons.length + 1}` }]);
    }
  };

  const handleRemoveButton = (idx: number) => {
    setButtons(buttons.filter((_, i) => i !== idx));
  };

  const handleUpdateButtonText = (idx: number, text: string) => {
    const updated = [...buttons];
    updated[idx].text = text;
    setButtons(updated);
  };

  const handleUpdateButtonTarget = (idx: number, val: string) => {
    const updated = [...buttons];
    if (updated[idx].type === 'URL') updated[idx].url = val;
    if (updated[idx].type === 'PHONE_NUMBER') updated[idx].phoneNumber = val;
    setButtons(updated);
  };

  // Submit complete template
  const handleSubmitTemplate = async () => {
    if (!templateName.trim()) {
      setWizardError('Template name is required');
      setWizardStep(2);
      return;
    }
    if (!bodyText.trim()) {
      setWizardError('Body text is required');
      return;
    }

    setSubmitting(true);
    setWizardError('');
    try {
      await api.post('/templates', {
        name: templateName,
        category,
        subCategory,
        language: languages[0] || 'en_US',
        languages,
        headerType,
        headerText,
        headerMediaUrl,
        bodyText,
        footerText,
        buttons,
      });

      setShowWizard(false);
      fetchTemplates();
    } catch (err: any) {
      setWizardError(err.response?.data?.message || 'Failed to create template');
    } finally {
      setSubmitting(false);
    }
  };

  // Test Message Send
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate || !testPhone) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await api.post(`/templates/${activeTemplate._id}/send-test`, {
        recipientPhone: testPhone,
        variables: { '1': var1, '2': var2 },
        mediaUrl: activeTemplate.headerMediaUrl,
      });
      setTestResult(res.data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.response?.data?.message || err.message });
    } finally {
      setSendingTest(false);
    }
  };

  const filtered = templates.filter((t) => {
    const matchesCat = filterCategory === 'ALL' || t.category === filterCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.bodyText?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            WhatsApp Template Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, synchronise and test official Meta Cloud API approved message templates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync from Meta'}</span>
          </button>

          <button
            onClick={openNewWizard}
            className="flex-1 sm:flex-initial px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by name or content..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid with Live Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filtered.map((tpl) => (
          <div
            key={tpl._id}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Card Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-900 tracking-tight truncate mr-2">
                  {tpl.name}
                </span>
                <StatusBadge status={tpl.status} />
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-200/70 font-semibold text-slate-700">
                  {tpl.category}
                </span>
                <span>•</span>
                <span>{tpl.language}</span>
              </div>
            </div>

            {/* Template WhatsApp Mock Bubble */}
            <div className="p-4 sm:p-5 flex-1 bg-[#EFEAE2]/30 flex flex-col justify-center">
              <div className="bg-[#D9FDD3] rounded-2xl p-3.5 sm:p-4 shadow-sm text-xs text-slate-800 space-y-2 border border-emerald-100 relative">
                {/* Header Image or Text */}
                {tpl.headerType === 'IMAGE' && tpl.headerMediaUrl && (
                  <div className="rounded-xl overflow-hidden mb-2 border border-emerald-200/60 max-h-36 bg-slate-100">
                    <img src={tpl.headerMediaUrl} alt="Header" className="w-full h-full object-cover" />
                  </div>
                )}
                {tpl.headerText && (
                  <div className="font-bold text-slate-900 text-xs sm:text-[13px]">{tpl.headerText}</div>
                )}

                <div className="leading-relaxed whitespace-pre-wrap">{tpl.bodyText}</div>

                {tpl.footerText && (
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-emerald-200/60">
                    {tpl.footerText}
                  </div>
                )}

                {/* Buttons display */}
                {tpl.buttons && tpl.buttons.length > 0 && (
                  <div className="pt-2 border-t border-emerald-200/60 space-y-1">
                    {tpl.buttons.map((b: any, bi: number) => (
                      <div
                        key={bi}
                        className="py-1 px-2.5 rounded-lg bg-white/80 border border-emerald-200/80 text-emerald-800 font-semibold text-center text-[10px]"
                      >
                        {b.type === 'OPT_OUT' ? '🛑 STOP' : b.type === 'URL' ? `🌐 ${b.text}` : b.type === 'PHONE_NUMBER' ? `📞 ${b.text}` : b.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono truncate max-w-[130px]">
                {tpl.metaTemplateId || 'meta_tpl'}
              </span>
              <button
                onClick={() => {
                  setActiveTemplate(tpl);
                  setTestResult(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-sm shadow-emerald-600/20"
              >
                <Send className="w-3 h-3" />
                <span>Send Test</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================== */}
      {/* FULL-SCREEN 3-STEP META TEMPLATE CREATION WIZARD (FROM IMAGES) */}
      {/* ============================================================== */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#F8FAFC] w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Wizard Header Bar */}
            <div className="px-5 sm:px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {wizardStep === 1 && 'Step 1: Choose Template Category'}
                    {wizardStep === 2 && 'Step 2: Template Name & Languages'}
                    {wizardStep === 3 && 'Step 3: Edit Template Content & Media'}
                  </h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span className={wizardStep === 1 ? 'font-bold text-emerald-600' : ''}>1. Category</span>
                    <span>→</span>
                    <span className={wizardStep === 2 ? 'font-bold text-emerald-600' : ''}>2. Name & Language</span>
                    <span>→</span>
                    <span className={wizardStep === 3 ? 'font-bold text-emerald-600' : ''}>3. Content & Media</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowWizard(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wizard Scrollable Content Body */}
            <div className="p-4 sm:p-8 overflow-y-auto flex-1">
              {wizardError && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {wizardError}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 1: CATEGORY SELECTION (IMAGES 2 & 3) */}
              {/* -------------------------------------------------------- */}
              {wizardStep === 1 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Category</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose a category that best describes your message template.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Marketing Card */}
                    <div
                      className={`p-5 rounded-2xl border transition-all ${
                        category === 'MARKETING'
                          ? 'border-emerald-500 bg-white shadow-md ring-1 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <label className="flex items-start space-x-3.5 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={category === 'MARKETING'}
                          onChange={() => {
                            setCategory('MARKETING');
                            setSubCategory('CUSTOM');
                          }}
                          className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 text-sm">Marketing</div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Send promotions or information about your products, services or business.
                          </p>

                          {category === 'MARKETING' && (
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 pl-1">
                              {[
                                {
                                  id: 'CUSTOM',
                                  title: 'Custom',
                                  desc: 'Send promotional offers, announcements and more to increase awareness and engagement.',
                                },
                                {
                                  id: 'FORM',
                                  title: 'Form',
                                  desc: 'Send a custom form for lead generation, registration or re-engagement.',
                                },
                                {
                                  id: 'PRODUCT',
                                  title: 'Product messages',
                                  desc: 'Send messages about your entire catalogue or multiple products from it.',
                                },
                                {
                                  id: 'CAROUSEL',
                                  title: 'Carousel messages',
                                  desc: 'Send single text message accompanied by a set of up to 10 carousel cards in a horizontally scrollable view.',
                                },
                              ].map((sub) => (
                                <label
                                  key={sub.id}
                                  className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                  <input
                                    type="radio"
                                    name="marketing_sub"
                                    checked={subCategory === sub.id}
                                    onChange={() => setSubCategory(sub.id)}
                                    className="mt-1 w-3.5 h-3.5 text-emerald-600"
                                  />
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">{sub.title}</div>
                                    <div className="text-[11px] text-slate-500 leading-normal">{sub.desc}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Utility Card */}
                    <div
                      className={`p-5 rounded-2xl border transition-all ${
                        category === 'UTILITY'
                          ? 'border-emerald-500 bg-white shadow-md ring-1 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <label className="flex items-start space-x-3.5 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={category === 'UTILITY'}
                          onChange={() => {
                            setCategory('UTILITY');
                            setSubCategory('CUSTOM');
                          }}
                          className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 text-sm">Utility</div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Send messages about an existing order or account.
                          </p>

                          {category === 'UTILITY' && (
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 pl-1">
                              {[
                                { id: 'CUSTOM', title: 'Custom', desc: 'Create your own message.' },
                                {
                                  id: 'ORDER_DETAIL',
                                  title: 'Order detail message',
                                  desc: 'Send message with order details and payment options.',
                                },
                                {
                                  id: 'ORDER_STATUS',
                                  title: 'Order status message',
                                  desc: 'Send message with order status.',
                                },
                              ].map((sub) => (
                                <label
                                  key={sub.id}
                                  className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                  <input
                                    type="radio"
                                    name="utility_sub"
                                    checked={subCategory === sub.id}
                                    onChange={() => setSubCategory(sub.id)}
                                    className="mt-1 w-3.5 h-3.5 text-emerald-600"
                                  />
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">{sub.title}</div>
                                    <div className="text-[11px] text-slate-500 leading-normal">{sub.desc}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Authentication Card */}
                    <div
                      className={`p-5 rounded-2xl border transition-all ${
                        category === 'AUTHENTICATION'
                          ? 'border-emerald-500 bg-white shadow-md ring-1 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <label className="flex items-start space-x-3.5 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={category === 'AUTHENTICATION'}
                          onChange={() => {
                            setCategory('AUTHENTICATION');
                            setSubCategory('CUSTOM');
                          }}
                          className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Authentication</div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Send codes to verify a transaction or login.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 2: NAME & LANGUAGES (IMAGE 4) */}
              {/* -------------------------------------------------------- */}
              {wizardStep === 2 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  {/* Name Card */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-900">Name</label>
                      <span className="text-xs font-mono text-slate-400">
                        {templateName.length}/512
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Name your message template (only lowercase letters and underscores).</p>
                    <input
                      type="text"
                      maxLength={512}
                      value={templateName}
                      onChange={(e) =>
                        setTemplateName(
                          e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                        )
                      }
                      placeholder="e.g. spring_flash_sale_promo"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Languages Card */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                    <label className="text-sm font-bold text-slate-900">Languages</label>
                    <p className="text-xs text-slate-500">
                      Choose languages for your message template. You can delete or add more languages later.
                    </p>

                    <div className="p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 min-h-[46px] bg-slate-50/50">
                      {languages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(lang)}
                            className="text-slate-400 hover:text-rose-500 mr-1"
                          >
                            ×
                          </button>
                          <span>{lang}</span>
                        </span>
                      ))}

                      <input
                        type="text"
                        value={newLangInput}
                        onChange={(e) => setNewLangInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLanguage(newLangInput);
                          }
                        }}
                        placeholder="Type language & press Enter..."
                        className="bg-transparent text-xs text-slate-700 focus:outline-none flex-1 min-w-[140px]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['English', 'Spanish', 'French', 'German', 'Hindi', 'Arabic', 'Portuguese'].map(
                        (preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAddLanguage(preset)}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            + {preset}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!templateName.trim()) {
                          setWizardError('Please enter a template name');
                          return;
                        }
                        setWizardError('');
                        setWizardStep(3);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center space-x-1"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 3: EDIT TEMPLATE & MEDIA UPLOAD + LIVE PREVIEW */}
              {/* -------------------------------------------------------- */}
              {wizardStep === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left 7 Columns: Complete Form Builder (Images 5 & 6) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Header Section */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-bold text-slate-900">Header</label>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Optional
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Add a title or choose which type of media you'll use for this header.
                      </p>

                      {/* Header Type Dropdown */}
                      <div>
                        <select
                          value={headerType === 'NONE' ? 'None' : headerType === 'TEXT' ? 'Text' : 'Media'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'None') setHeaderType('NONE');
                            else if (val === 'Text') setHeaderType('TEXT');
                            else setHeaderType('IMAGE');
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="None">None</option>
                          <option value="Text">Text</option>
                          <option value="Media">Media</option>
                        </select>
                      </div>

                      {/* If Text Header */}
                      {headerType === 'TEXT' && (
                        <div>
                          <input
                            type="text"
                            maxLength={60}
                            value={headerText}
                            onChange={(e) => setHeaderText(e.target.value)}
                            placeholder="Enter header title (e.g. Special Announcement)"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none"
                          />
                        </div>
                      )}

                      {/* If Media Header: 4 Visual Cards (Image 5) */}
                      {headerType !== 'NONE' && headerType !== 'TEXT' && (
                        <div className="space-y-4 pt-1">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { id: 'IMAGE', title: 'Image', limit: '5 MB', icon: ImageIcon },
                              { id: 'VIDEO', title: 'Video', limit: '16 MB', icon: Video },
                              { id: 'DOCUMENT', title: 'Document', limit: '100 MB', icon: FileText },
                              { id: 'LOCATION', title: 'Location', limit: 'Maps', icon: MapPin },
                            ].map((media) => {
                              const Icon = media.icon;
                              const isSelected = headerType === media.id;
                              return (
                                <button
                                  key={media.id}
                                  type="button"
                                  onClick={() => setHeaderType(media.id as any)}
                                  className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                                    isSelected
                                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20'
                                      : 'border-slate-200 hover:border-slate-300 bg-white'
                                  }`}
                                >
                                  <div className="w-4 h-4 mb-2 flex items-center justify-center">
                                    <input
                                      type="radio"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      className="text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                                    />
                                  </div>
                                  <Icon className={`w-7 h-7 mb-1.5 ${isSelected ? 'text-emerald-600' : 'text-slate-600'}`} />
                                  <div className="font-bold text-xs text-slate-800">{media.title}</div>
                                  <div className="text-[10px] text-slate-400">{media.limit}</div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Real Image File Upload / Media Upload Area */}
                          {headerType === 'IMAGE' && (
                            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center hover:bg-slate-100/50 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                              />

                              {headerMediaUrl ? (
                                <div className="space-y-2">
                                  <img
                                    src={headerMediaUrl}
                                    alt="Uploaded header"
                                    className="max-h-40 mx-auto rounded-xl object-contain shadow-sm border border-slate-200"
                                  />
                                  <div className="text-xs font-mono text-slate-600 truncate max-w-xs mx-auto">
                                    {headerMediaName || 'Header Image Uploaded'}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setHeaderMediaUrl('');
                                      setHeaderMediaName('');
                                    }}
                                    className="text-xs font-semibold text-rose-600 hover:underline"
                                  >
                                    Remove / Replace Image
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                  <div className="text-xs font-bold text-slate-800">
                                    Upload header sample image (JPG, PNG - max 5 MB)
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Meta requires a sample image to approve media templates
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-3 px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                                  >
                                    Select Image File
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {headerType === 'VIDEO' && (
                            <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600">
                              <label className="block font-semibold mb-1">Sample Video URL (MP4 - max 16MB)</label>
                              <input
                                type="text"
                                value={headerMediaUrl}
                                onChange={(e) => setHeaderMediaUrl(e.target.value)}
                                placeholder="https://example.com/sample_video.mp4"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                          )}

                          {headerType === 'DOCUMENT' && (
                            <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600">
                              <label className="block font-semibold mb-1">Sample Document URL (PDF - max 100MB)</label>
                              <input
                                type="text"
                                value={headerMediaUrl}
                                onChange={(e) => setHeaderMediaUrl(e.target.value)}
                                placeholder="https://example.com/brochure.pdf"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Body Section (Images 5 & 6) */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-900">Body</label>
                        {/* Rich text formatting bar */}
                        <div className="flex items-center space-x-1 text-slate-600">
                          <button
                            type="button"
                            onClick={() => insertFormatting('😊 ', '')}
                            title="Insert Emoji"
                            className="p-1 rounded hover:bg-slate-100"
                          >
                            <Smile className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('*', '*')}
                            title="Bold (*text*)"
                            className="p-1 rounded hover:bg-slate-100"
                          >
                            <Bold className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('_', '_')}
                            title="Italic (_text_)"
                            className="p-1 rounded hover:bg-slate-100"
                          >
                            <Italic className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('~', '~')}
                            title="Strikethrough (~text~)"
                            className="p-1 rounded hover:bg-slate-100"
                          >
                            <Strikethrough className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('```', '```')}
                            title="Code (```monospace```)"
                            className="p-1 rounded hover:bg-slate-100"
                          >
                            <Code className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        ref={bodyTextareaRef}
                        rows={5}
                        maxLength={1024}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        placeholder="Enter template message text..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-sans"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={handleAddVariable}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1"
                        >
                          <span>+ Add Variable</span>
                        </button>
                        <span className="text-xs font-mono text-slate-400">
                          {bodyText.length}/1024
                        </span>
                      </div>
                    </div>

                    {/* Footer Section (Image 6) */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-bold text-slate-900">Footer</label>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Optional
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Add a short line of text to the bottom of your message template. If you add the marketing opt-out button, the associated footer will be shown here by default.
                      </p>
                      <input
                        type="text"
                        maxLength={60}
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        placeholder="Enter text in English (0/60)"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none"
                      />
                      <div className="text-right text-xs font-mono text-slate-400">
                        {footerText.length}/60
                      </div>
                    </div>

                    {/* Buttons Section (Image 6) */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-bold text-slate-900">Buttons</label>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Optional
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Create buttons that let customers respond to your message or take action..
                      </p>

                      {/* Official Meta Recommendation Alert Box (from Image 6) */}
                      <div className="p-4 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-700 space-y-1">
                        <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>We Recommend Adding The Marketing Opt-Out Button</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal">
                          Allow customers to request to opt out of all marketing messages. This can help reduce blocks from customers and increase your quality rating.
                        </p>
                      </div>

                      {/* List of current buttons */}
                      <div className="space-y-2.5">
                        {buttons.map((btn, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                {btn.type.replace('_', ' ')}
                              </span>
                              <input
                                type="text"
                                value={btn.text}
                                onChange={(e) => handleUpdateButtonText(idx, e.target.value)}
                                className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-white font-medium"
                              />
                            </div>

                            {btn.type === 'URL' && (
                              <input
                                type="text"
                                value={btn.url || ''}
                                onChange={(e) => handleUpdateButtonTarget(idx, e.target.value)}
                                placeholder="https://example.com"
                                className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-200 bg-white font-mono"
                              />
                            )}

                            {btn.type === 'PHONE_NUMBER' && (
                              <input
                                type="text"
                                value={btn.phoneNumber || ''}
                                onChange={(e) => handleUpdateButtonTarget(idx, e.target.value)}
                                placeholder="+1 555 123 4567"
                                className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-200 bg-white font-mono"
                              />
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveButton(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 self-end sm:self-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* + Add A Button Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowAddButtonDropdown(!showAddButtonDropdown)}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1"
                        >
                          <span>+ Add A Button ▾</span>
                        </button>

                        {showAddButtonDropdown && (
                          <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs">
                            <button
                              type="button"
                              onClick={() => handleAddButton('QUICK_REPLY')}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                            >
                              Quick Reply Button
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddButton('URL')}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-1"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                              <span>Visit Website (URL)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddButton('PHONE_NUMBER')}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-1"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>Call Phone Number</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddButton('OPT_OUT')}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-semibold text-emerald-600"
                            >
                              Marketing Opt-Out (STOP)
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        If you add more than three buttons, they will appear in a list.
                      </p>
                    </div>

                    {/* Step 3 Navigation Action Bar */}
                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setWizardStep(2)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmitTemplate}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/25 flex items-center space-x-1.5"
                      >
                        <span>{submitting ? 'Submitting to Meta...' : 'Submit Template to Meta'}</span>
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right 5 Columns: Realistic Interactive WhatsApp Phone Preview Mockup */}
                  <div className="lg:col-span-5 sticky top-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Live WhatsApp Preview
                    </div>

                    {/* Device Phone Frame */}
                    <div className="w-full max-w-[340px] mx-auto bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800">
                      {/* Phone Speaker & Notch */}
                      <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-slate-800 mr-2"></div>
                        <div className="w-8 h-1 rounded-full bg-slate-800"></div>
                      </div>

                      {/* Phone Screen */}
                      <div className="bg-[#EFEAE2] rounded-[28px] overflow-hidden flex flex-col h-[520px]">
                        {/* WhatsApp Chat Header */}
                        <div className="bg-[#075E54] text-white p-3 flex items-center space-x-2.5 shrink-0 shadow">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                            W
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs truncate">My Business</div>
                            <div className="text-[10px] text-emerald-200 flex items-center space-x-1">
                              <span>Official Account</span>
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />
                            </div>
                          </div>
                        </div>

                        {/* Chat Body */}
                        <div className="p-3.5 flex-1 overflow-y-auto space-y-2 flex flex-col justify-end">
                          <div className="bg-[#D9FDD3] rounded-2xl rounded-tr-none p-3 shadow-sm text-xs text-slate-900 space-y-2 border border-emerald-100 max-w-[95%] self-end">
                            {/* Header preview */}
                            {headerType === 'IMAGE' && headerMediaUrl && (
                              <div className="rounded-xl overflow-hidden mb-1 border border-emerald-200/60 max-h-36 bg-slate-100">
                                <img
                                  src={headerMediaUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {headerType === 'TEXT' && headerText && (
                              <div className="font-bold text-slate-950 text-xs">{headerText}</div>
                            )}

                            {/* Body text with styled formatting preview */}
                            <div className="leading-relaxed whitespace-pre-wrap text-[11px]">
                              {bodyText}
                            </div>

                            {/* Footer preview */}
                            {footerText && (
                              <div className="text-[9px] text-slate-500 pt-1 border-t border-emerald-200/60">
                                {footerText}
                              </div>
                            )}

                            <div className="text-[9px] text-slate-400 text-right">
                              12:45 PM • <span className="text-teal-600">✓✓</span>
                            </div>

                            {/* Buttons Preview inside WhatsApp Bubble */}
                            {buttons.length > 0 && (
                              <div className="pt-2 border-t border-emerald-200/70 space-y-1">
                                {buttons.map((btn, i) => (
                                  <div
                                    key={i}
                                    className="py-1 px-2 rounded-lg bg-white/90 border border-emerald-300/80 text-emerald-800 text-[10px] font-semibold text-center flex items-center justify-center space-x-1 shadow-2xs"
                                  >
                                    {btn.type === 'OPT_OUT' && <span>🛑 STOP</span>}
                                    {btn.type === 'URL' && <span>🌐 {btn.text}</span>}
                                    {btn.type === 'PHONE_NUMBER' && <span>📞 {btn.text}</span>}
                                    {btn.type === 'QUICK_REPLY' && <span>{btn.text}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* WhatsApp Input Placeholder Bar */}
                        <div className="bg-slate-100 p-2 flex items-center space-x-2 border-t border-slate-200 shrink-0">
                          <div className="flex-1 bg-white rounded-full px-3 py-1 text-[10px] text-slate-400">
                            Type a message...
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#128C7E] flex items-center justify-center text-white">
                            <Send className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEND TEST MODAL (WITH VARIABLE VALUES & HEADER MEDIA PREVIEW) */}
      {/* ============================================================== */}
      {activeTemplate && (
        <Modal
          isOpen={!!activeTemplate}
          onClose={() => setActiveTemplate(null)}
          title={`Send Test: ${activeTemplate.name}`}
        >
          <form onSubmit={handleSendTest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recipient WhatsApp Number (with country code)
              </label>
              <input
                type="text"
                required
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="e.g. 15552345678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Variable {'{{1}}'}</label>
                <input
                  type="text"
                  value={var1}
                  onChange={(e) => setVar1(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Variable {'{{2}}'}</label>
                <input
                  type="text"
                  value={var2}
                  onChange={(e) => setVar2(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Template Header Image Preview if exists */}
            {activeTemplate.headerMediaUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 p-2 bg-slate-50 flex items-center space-x-3">
                <img
                  src={activeTemplate.headerMediaUrl}
                  alt="Template Media"
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <div className="text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">Media Header Attached</div>
                  <div className="text-[10px] text-slate-400">Will be dispatched via WhatsApp Cloud API</div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Preview:</span>{' '}
              {activeTemplate.bodyText?.replace('{{1}}', var1).replace('{{2}}', var2)}
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs font-mono border ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div>{testResult.success ? '✔ Dispatched to WhatsApp' : '✖ Failed'}</div>
                {testResult.metaMessageId && <div>ID: {testResult.metaMessageId}</div>}
                {testResult.error && <div>Error: {testResult.error}</div>}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTemplate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={sendingTest}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
              >
                {sendingTest ? 'Sending...' : 'Send Test Message'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
