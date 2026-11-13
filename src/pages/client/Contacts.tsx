import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import * as XLSX from 'xlsx';
import {
  Users2,
  UserPlus,
  Upload,
  Search,
  Filter,
  Download,
  Settings,
  Pencil,
  FileText,
  X,
  Plus,
  Check,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  Phone,
  ChevronDown,
} from 'lucide-react';

interface ContactItem {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  group?: string;
  consentStatus: string;
  consentSource?: string;
  optOut: boolean;
  createdAt: string;
}

interface SegmentFilterItem {
  field: string;
  attribute: string;
  value: string;
}

interface SegmentItem {
  _id: string;
  name: string;
  filters: SegmentFilterItem[];
  contactCount: number;
}

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [savedSegments, setSavedSegments] = useState<SegmentItem[]>([]);

  // Selected row checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk Import Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [parsedImportList, setParsedImportList] = useState<any[]>([]);
  const [showRawPaste, setShowRawPaste] = useState(false);
  const [rawPasteText, setRawPasteText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Segment Filter Modal state
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [segmentFilters, setSegmentFilters] = useState<SegmentFilterItem[]>([
    { field: 'Tags', attribute: 'Is', value: '' },
  ]);
  const [segmentName, setSegmentName] = useState('');
  const [segmentMatchingCount, setSegmentMatchingCount] = useState<number>(0);
  const [savingSegment, setSavingSegment] = useState(false);
  const [segmentError, setSegmentError] = useState('');

  // Add Single Contact Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [singleName, setSingleName] = useState('');
  const [singlePhone, setSinglePhone] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [singleTags, setSingleTags] = useState('WhatsApp');
  const [singleGroup, setSingleGroup] = useState('K7ChitFundsGroup');
  const [savingSingle, setSavingSingle] = useState(false);

  useEffect(() => {
    fetchData();
  }, [search, activeTab]);

  useEffect(() => {
    if (showSegmentModal) {
      calculatePreviewCount();
    }
  }, [segmentFilters, contacts]);

  const fetchData = async () => {
    try {
      // Find contacts based on active tab (all or specific segment/tag/group)
      let queryParams: any = { search: search || undefined };

      if (activeTab !== 'all') {
        // check if activeTab corresponds to a saved segment
        const matchingSeg = savedSegments.find((s) => s.name === activeTab);
        if (matchingSeg && matchingSeg.filters?.length > 0) {
          const firstTag = matchingSeg.filters.find((f) => f.field.toLowerCase() === 'tags');
          if (firstTag?.value) {
            queryParams.tag = firstTag.value;
          } else {
            queryParams.group = matchingSeg.name;
          }
        } else {
          // If active tab is a group name or tag
          queryParams.group = activeTab;
        }
      }

      const [contactsRes, tagsRes, segmentsRes] = await Promise.all([
        api.get('/contacts', { params: queryParams }),
        api.get('/contacts/tags').catch(() => ({ data: [] })),
        api.get('/contacts/segments').catch(() => ({ data: [] })),
      ]);

      setContacts(contactsRes.data);
      setAllTags(tagsRes.data || []);
      setSavedSegments(segmentsRes.data || []);
    } catch (err) {
      console.error('Failed to load contacts data', err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 1. EXCEL/CSV TEMPLATE DOWNLOAD (Exact columns from user specification)
  // =========================================================================
  const handleDownloadExcelTemplate = () => {
    const headers = [
      'Name',
      'Contact',
      'Email',
      'Group',
      'Last followup',
      'Reminder',
      'Address',
      'Assigned to',
      'Tags',
      'Message Opt-in',
      'Response time',
    ];

    const sampleRows = [
      {
        Name: 'K7 Client Sample 1',
        Contact: '918883333308',
        Email: 'client1@example.com',
        Group: 'K7ChitFundsGroup',
        'Last followup': '2026-11-10',
        Reminder: 'Follow up call',
        Address: 'Coimbatore, Tamil Nadu',
        'Assigned to': 'Admin',
        Tags: 'K7chitfunds10M',
        'Message Opt-in': 'yes',
        'Response time': 'instant',
      },
      {
        Name: 'K7 Client Sample 2',
        Contact: '919842090956',
        Email: 'client2@example.com',
        Group: 'K7ChitFundsGroup',
        'Last followup': '',
        Reminder: '',
        Address: 'Chennai, Tamil Nadu',
        'Assigned to': 'Agent 1',
        Tags: 'K7chitfunds10M',
        'Message Opt-in': 'yes',
        'Response time': '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts_Import_Template');
    XLSX.writeFile(wb, 'WhatsApp_Contacts_Import_Template.xlsx');
  };

  // =========================================================================
  // 2. BULK FILE UPLOAD & PARSER (Supports .xlsx, .xls, and .csv)
  // =========================================================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setImportMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws, { raw: false });

        const mapped: any[] = [];
        data.forEach((row: any) => {
          // Look for Contact/Phone/Mobile field
          const rawPhone =
            row['Contact'] ||
            row['contact'] ||
            row['Phone'] ||
            row['phone'] ||
            row['Mobile'] ||
            row['mobile'] ||
            '';

          if (!rawPhone) return;

          // Split comma-separated numbers if multiple are on one line
          const phoneTokens = String(rawPhone).split(/[,;/]+/);

          phoneTokens.forEach((pt) => {
            // Strip .0 float suffix and non-digits
            const clean = pt.replace(/\.0+$/, '').trim().replace(/\D/g, '');
            if (clean.length >= 8) {
              const rawTags = row['Tags'] || row['tags'] || row['Tag'] || '';
              const tagList = String(rawTags)
                .split(/[,|;]+/)
                .map((t) => t.trim())
                .filter(Boolean);

              mapped.push({
                name: row['Name'] || row['name'] || `Contact ${clean.slice(-4)}`,
                phone: clean,
                email: row['Email'] || row['email'] || '',
                group: row['Group'] || row['group'] || 'K7ChitFundsGroup',
                tags: tagList.length > 0 ? tagList : ['K7chitfunds10M'],
                consentSource: 'xlsx_import',
              });
            }
          });
        });

        setParsedImportList(mapped);
      } catch (err) {
        console.error('File parsing error', err);
        setImportMessage({
          type: 'error',
          text: 'Failed to read file format. Please check the Excel/CSV sheet.',
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Parse raw pasted CSV text
  const parseRawPaste = () => {
    if (!rawPasteText.trim()) return [];
    const lines = rawPasteText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const result: any[] = [];
    const startIdx = lines[0].toLowerCase().includes('contact') || lines[0].toLowerCase().includes('phone') ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) => p.replace(/^"|"$/g, '').trim());
      // In user's pasted format: Name(0), Contact(1), Email(2), Group(3)... Tags(8)
      const rawPhone = parts[1] || parts[0];
      if (!rawPhone) continue;

      const phoneTokens = String(rawPhone).split(/[,;/]+/);
      phoneTokens.forEach((pt) => {
        const clean = pt.replace(/\.0+$/, '').trim().replace(/\D/g, '');
        if (clean.length >= 8) {
          const rawTag = parts[8] || parts[3] || 'K7chitfunds10M';
          const tagList = rawTag.split(/[,|;]+/).map((t) => t.trim()).filter(Boolean);

          result.push({
            name: parts[0] || `Contact ${clean.slice(-4)}`,
            phone: clean,
            email: parts[2] || '',
            group: parts[3] || 'K7ChitFundsGroup',
            tags: tagList.length > 0 ? tagList : ['K7chitfunds10M'],
            consentSource: 'csv_raw_paste',
          });
        }
      });
    }
    return result;
  };

  const handleExecuteImport = async () => {
    let itemsToUpload = [...parsedImportList];

    if (showRawPaste && rawPasteText.trim()) {
      const pasted = parseRawPaste();
      itemsToUpload = [...itemsToUpload, ...pasted];
    }

    if (itemsToUpload.length === 0) {
      setImportMessage({
        type: 'error',
        text: 'Please select a valid .xlsx/.csv file or paste raw contact records.',
      });
      return;
    }

    setImporting(true);
    setImportMessage(null);

    try {
      const res = await api.post('/contacts/bulk-import', { contacts: itemsToUpload });
      setImportMessage({
        type: 'success',
        text: `Successfully imported ${res.data.imported} contacts! (${res.data.skipped} duplicates/invalid skipped)`,
      });

      // Clear input and reload contacts
      setTimeout(() => {
        setShowImportModal(false);
        setParsedImportList([]);
        setSelectedFileName('');
        setRawPasteText('');
        fetchData();
      }, 1500);
    } catch (err: any) {
      setImportMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to complete bulk import.',
      });
    } finally {
      setImporting(false);
    }
  };

  // =========================================================================
  // 3. SEGMENT FILTER & CREATION (Exact Match to Images 1 & 2)
  // =========================================================================
  const calculatePreviewCount = () => {
    if (!contacts) return;
    let matched = contacts.filter((c) => {
      return segmentFilters.every((f) => {
        if (!f.value) return true;
        const field = f.field.toLowerCase();
        const val = f.value.toLowerCase().trim();

        if (field === 'tags' || field === 'tag') {
          return c.tags?.some((t) => t.toLowerCase().includes(val));
        }
        if (field === 'group') {
          return (c.group || '').toLowerCase().includes(val);
        }
        if (field === 'consent status') {
          return c.consentStatus?.toLowerCase() === val;
        }
        if (field === 'name') {
          return c.name?.toLowerCase().includes(val);
        }
        return true;
      });
    });
    setSegmentMatchingCount(matched.length);
  };

  const handleAddFilterRow = () => {
    setSegmentFilters([...segmentFilters, { field: 'Tags', attribute: 'Is', value: '' }]);
  };

  const handleUpdateFilter = (index: number, key: keyof SegmentFilterItem, val: string) => {
    const updated = [...segmentFilters];
    updated[index][key] = val;
    setSegmentFilters(updated);
  };

  const handleSaveSegment = async () => {
    if (!segmentName.trim()) {
      setSegmentError('Please enter a segment name');
      return;
    }

    setSavingSegment(true);
    setSegmentError('');

    try {
      await api.post('/contacts/segments', {
        name: segmentName.trim(),
        filters: segmentFilters,
      });

      setShowSegmentModal(false);
      setSegmentName('');
      setSegmentFilters([{ field: 'Tags', attribute: 'Is', value: '' }]);
      fetchData();
    } catch (err: any) {
      setSegmentError(err.response?.data?.message || 'Failed to save segment');
    } finally {
      setSavingSegment(false);
    }
  };

  // =========================================================================
  // 4. ROW SELECTION & ACTIONS
  // =========================================================================
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(contacts.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleOptOut = async (id: string) => {
    try {
      await api.patch(`/contacts/${id}/toggle-opt-out`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Pre-configured tags matching Image 2
  const tagDropdownOptions = Array.from(
    new Set([
      'DIWALI',
      'Diwali',
      'K7DiwaliWish',
      'K7chitfunds10M',
      'WhatsApp',
      'k7COntactsDiwali',
      ...allTags,
    ]),
  ).filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* TOP HEADER CONTROLS (IMAGE 3) */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Quota */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Contacts</span>
            <span className="text-sm font-semibold text-slate-500">
              ({contacts.length} / 50000)
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your customer database, create filter segments, and broadcast with verified consent.
          </p>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Contacts Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Contacts"
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs w-48 sm:w-60"
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowSegmentModal(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
            title="Add Filters to Create a Segment"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Export button */}
          <button
            onClick={handleDownloadExcelTemplate}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
            title="Download Template / Export"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import Button (Pill button from Image 3) */}
          <button
            onClick={() => {
              setImportMessage(null);
              setShowImportModal(true);
            }}
            className="px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Import</span>
          </button>

          {/* Add New Contact Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Contact</span>
          </button>

          {/* Create Segment Button (Images 1 & 2) */}
          <button
            onClick={() => setShowSegmentModal(true)}
            className="px-4 py-2 rounded-full bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Segment</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* GROUP / SEGMENT TABS BAR (IMAGE 3) */}
      {/* ============================================================== */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-1 overflow-x-auto text-xs">
        {/* Show All tab */}
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 px-3 font-bold transition-all flex items-center space-x-1 whitespace-nowrap ${
            activeTab === 'all'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Show All</span>
        </button>

        {/* Dynamic Groups & Segments Tabs */}
        {savedSegments.map((seg) => (
          <button
            key={seg._id}
            onClick={() => setActiveTab(seg.name)}
            className={`pb-2 px-3 font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === seg.name
                ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{seg.name}</span>
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold flex items-center justify-center">
              {seg.contactCount || 0}
            </span>
          </button>
        ))}

        {/* Direct Link to Create Segment Modal */}
        <button
          onClick={() => setShowSegmentModal(true)}
          className="pb-2 px-3 text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Group / Segment</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* CONTACTS DATA TABLE (IMAGE 3) */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={contacts.length > 0 && selectedIds.length === contacts.length}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-3 px-2 w-8 text-slate-400">
                  <Settings className="w-3.5 h-3.5" />
                </th>
                <th className="py-3 px-3 w-12 text-slate-500">#</th>
                <th className="py-3 px-4 min-w-[140px]">Name</th>
                <th className="py-3 px-4 min-w-[180px]">Contact</th>
                <th className="py-3 px-4 min-w-[180px]">Tags</th>
                <th className="py-3 px-4 min-w-[120px]">Consent</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((contact, idx) => (
                <tr
                  key={contact._id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    selectedIds.includes(contact._id) ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(contact._id)}
                      onChange={() => handleToggleRow(contact._id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>

                  {/* Settings / Actions icon */}
                  <td className="py-3.5 px-2 text-slate-400">
                    <button
                      onClick={() => alert(`Edit contact: ${contact.phone}`)}
                      className="hover:text-slate-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>

                  {/* Row index # */}
                  <td className="py-3.5 px-3 font-mono text-slate-400 font-semibold">
                    {idx + 1}
                  </td>

                  {/* Name */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 truncate max-w-xs">
                    {contact.name || `Contact ${contact.phone.slice(-4)}`}
                  </td>

                  {/* WhatsApp Contact with green phone icon (Image 3) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 font-mono text-slate-800 font-semibold">
                      <div className="w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                        <Phone className="w-2.5 h-2.5 fill-current" />
                      </div>
                      <span>{contact.phone}</span>
                    </div>
                  </td>

                  {/* Tags badge (Image 3) */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags && contact.tags.length > 0 ? (
                        contact.tags.map((tag, ti) => (
                          <span
                            key={ti}
                            className="px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#166534] border border-emerald-300 text-[11px] font-bold"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No tags</span>
                      )}
                    </div>
                  </td>

                  {/* Consent status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        contact.optOut
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {contact.optOut ? 'OPTED OUT' : 'OPTED IN'}
                    </span>
                  </td>

                  {/* Opt-out toggle */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleOptOut(contact._id)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                        contact.optOut
                          ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {contact.optOut ? 'Re-subscribe' : 'Opt Out'}
                    </button>
                  </td>
                </tr>
              ))}

              {contacts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No contacts found in this group</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Import" to upload your Excel/CSV contacts or "Create Segment" to filter contacts.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BULK IMPORT DATA DRAWER / MODAL (EXACT MATCH TO IMAGE 3)       */}
      {/* ============================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Bulk Import Data</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Instructions Paragraph */}
              <p className="text-xs text-slate-600 leading-relaxed">
                For accurate uploading of your bulk contacts data sheet, place data into our format
                without making any changes to the columns. Then, proceed for uploading the excel
                sheet. Accepted format is .xlsx / .csv
              </p>

              {/* Link 1: Download Template */}
              <div>
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center space-x-1"
                >
                  <span>Click Here To Download Excel Import Format.</span>
                </button>
              </div>

              {/* Link 2: Insert Raw Contact Data */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowRawPaste(!showRawPaste)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center space-x-1"
                >
                  <span>Click Here To Insert Raw Contact Data.</span>
                </button>
              </div>

              {/* Collapsible Raw Data Textarea */}
              {showRawPaste && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Paste CSV Rows (Header: Name,Contact,Email,Group...Tags):
                  </label>
                  <textarea
                    rows={6}
                    value={rawPasteText}
                    onChange={(e) => setRawPasteText(e.target.value)}
                    placeholder="Paste CSV lines like:
,805666616.0,,,,,,,K7chitfunds10M,,
,4222231169.0,,,,,,,K7chitfunds10M,,"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <div className="text-[11px] text-slate-500">
                    {parseRawPaste().length} contacts recognized in pasted text
                  </div>
                </div>
              )}

              {/* File Upload Selector (Image 3) */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-800">
                  Select excel(.xlsx) file to import data
                </label>
                <div className="flex items-center rounded-xl border border-rose-400 bg-white p-1 shadow-2xs">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex-1 px-3 py-1.5 text-xs text-slate-600 truncate">
                    {selectedFileName || 'Choose file'}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Browse
                  </button>
                </div>

                {parsedImportList.length > 0 && (
                  <div className="text-xs font-bold text-emerald-700 flex items-center space-x-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{parsedImportList.length} contacts parsed from sheet</span>
                  </div>
                )}
              </div>

              {/* Google Sheet link (Image 3) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => alert('Google Sheets Sync: Connect your Google Drive in Settings.')}
                  className="text-xs font-semibold text-sky-600 hover:underline"
                >
                  Configure Google Sheet
                </button>
              </div>

              {/* Import status notification */}
              {importMessage && (
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold ${
                    importMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}
                >
                  {importMessage.text}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-5 py-2 rounded-full border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing}
                onClick={handleExecuteImport}
                className="px-6 py-2 rounded-full bg-[#22C55E] hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all"
              >
                {importing ? 'Uploading...' : 'Upload Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD FILTERS TO CREATE A SEGMENT (EXACT MATCH TO IMAGES 1 & 2) */}
      {/* ============================================================== */}
      {showSegmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Add Filters To Create A Segment
              </h3>
              <button
                onClick={() => setShowSegmentModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto">
              {segmentError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {segmentError}
                </div>
              )}

              {/* Filter Rows (Field, Attribute, Value) */}
              <div className="space-y-3">
                {segmentFilters.map((flt, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    {/* Field Dropdown */}
                    <div className="sm:col-span-4">
                      {idx === 0 && (
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Field
                        </label>
                      )}
                      <select
                        value={flt.field}
                        onChange={(e) => handleUpdateFilter(idx, 'field', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="Tags">Tags</option>
                        <option value="Group">Group</option>
                        <option value="Consent Status">Consent Status</option>
                        <option value="Name">Name</option>
                      </select>
                    </div>

                    {/* Attribute Dropdown */}
                    <div className="sm:col-span-3">
                      {idx === 0 && (
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Attribute
                        </label>
                      )}
                      <select
                        value={flt.attribute}
                        onChange={(e) => handleUpdateFilter(idx, 'attribute', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="Is">Is</option>
                        <option value="Contains">Contains</option>
                        <option value="Starts With">Starts With</option>
                      </select>
                    </div>

                    {/* Value Field (with dropdown of tags matching Image 2!) */}
                    <div className="sm:col-span-5 relative">
                      {idx === 0 && (
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Value
                        </label>
                      )}

                      {flt.field === 'Tags' ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={flt.value}
                            onChange={(e) => handleUpdateFilter(idx, 'value', e.target.value)}
                            placeholder="Select or type tag..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            list={`tags-datalist-${idx}`}
                          />
                          <datalist id={`tags-datalist-${idx}`}>
                            {tagDropdownOptions.map((t) => (
                              <option key={t} value={t} />
                            ))}
                          </datalist>
                        </div>
                      ) : flt.field === 'Group' ? (
                        <input
                          type="text"
                          value={flt.value}
                          onChange={(e) => handleUpdateFilter(idx, 'value', e.target.value)}
                          placeholder="e.g. K7ChitFundsGroup"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:outline-none"
                        />
                      ) : (
                        <select
                          value={flt.value}
                          onChange={(e) => handleUpdateFilter(idx, 'value', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white"
                        >
                          <option value="">Select status</option>
                          <option value="opted_in">Opted In</option>
                          <option value="opted_out">Opted Out</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add More Filter Button (Right-aligned pill from Image 1) */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddFilterRow}
                  className="px-4 py-1.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Add More Filter
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 pt-4"></div>

              {/* Lower Section (Image 1): Total Selected Contacts + Segment Name */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
                {/* Total Selected Contacts Count */}
                <div className="sm:col-span-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Total Selected Contacts
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                    {segmentMatchingCount}
                  </div>
                </div>

                {/* Segment Name Input */}
                <div className="sm:col-span-8 space-y-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    Segment Name
                  </label>
                  <input
                    type="text"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    placeholder="e.g. K7ChitFundsGroup or Diwali Audience"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer with Save Segment Button (Image 1) */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowSegmentModal(false)}
                className="px-4 py-2 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingSegment}
                onClick={handleSaveSegment}
                className="px-6 py-2 rounded-full bg-[#22C55E] hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all"
              >
                {savingSegment ? 'Saving...' : 'Save Segment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD SINGLE CONTACT MODAL                                       */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Single Contact</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={singlePhone}
                  onChange={(e) => setSinglePhone(e.target.value)}
                  placeholder="e.g. 918883333308"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={singleTags}
                  onChange={(e) => setSingleTags(e.target.value)}
                  placeholder="K7chitfunds10M, Diwali"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Group</label>
                <input
                  type="text"
                  value={singleGroup}
                  onChange={(e) => setSingleGroup(e.target.value)}
                  placeholder="K7ChitFundsGroup"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingSingle}
                onClick={async () => {
                  if (!singlePhone) return;
                  setSavingSingle(true);
                  try {
                    await api.post('/contacts', {
                      name: singleName || `Contact ${singlePhone.slice(-4)}`,
                      phone: singlePhone,
                      email: singleEmail || undefined,
                      tags: singleTags.split(',').map((t) => t.trim()).filter(Boolean),
                      group: singleGroup || undefined,
                    });
                    setShowAddModal(false);
                    setSingleName('');
                    setSinglePhone('');
                    fetchData();
                  } catch (err: any) {
                    alert(err.response?.data?.message || 'Failed to add contact');
                  } finally {
                    setSavingSingle(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                {savingSingle ? 'Saving...' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
