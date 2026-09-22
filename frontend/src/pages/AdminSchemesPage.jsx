import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit3, Trash2, CheckCircle, Database, 
  ExternalLink, Layers, ShieldCheck, Zap, RefreshCw, AlertCircle
} from 'lucide-react';
import { fetchAllSchemes, adminCreateScheme, fetchN8nEvents } from '../services/api';

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [n8nEvents, setN8nEvents] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState('schemes'); // 'schemes' | 'n8n' | 'create'
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [newScheme, setNewScheme] = useState({
    id: '',
    name: '',
    short_name: '',
    ministry: '',
    state: 'All India',
    category: 'Education',
    target_audience: 'Students, Youth',
    description: '',
    benefits: '',
    benefit_amount: 50000,
    max_income: 300000,
    required_documents: 'Aadhaar Card, Income Certificate, College Marksheet',
    application_procedure: 'Register online at portal, Submit documents, Institutional verification',
    official_source: 'https://',
    tags: 'education, scholarship, students'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schRes, n8nRes] = await Promise.all([
        fetchAllSchemes(),
        fetchN8nEvents()
      ]);
      if (schRes && schRes.data) setSchemes(schRes.data);
      if (n8nRes && n8nRes.data) setN8nEvents(n8nRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const payload = {
        id: newScheme.id.toLowerCase().trim().replace(/\s+/g, '-'),
        name: newScheme.name,
        short_name: newScheme.short_name,
        ministry: newScheme.ministry,
        state: newScheme.state,
        category: newScheme.category,
        target_audience: newScheme.target_audience.split(',').map((s) => s.trim()),
        description: newScheme.description,
        benefits: newScheme.benefits,
        benefit_amount: Number(newScheme.benefit_amount),
        eligibility: {
          max_income: Number(newScheme.max_income) || null,
          caste: 'All',
          gender: 'All'
        },
        required_documents: newScheme.required_documents.split(',').map((s) => s.trim()),
        application_procedure: newScheme.application_procedure.split(',').map((s) => s.trim()),
        official_source: newScheme.official_source,
        tags: newScheme.tags.split(',').map((s) => s.trim())
      };

      const res = await adminCreateScheme(payload);
      if (res && res.success) {
        setStatusMsg({ type: 'success', text: `Scheme '${payload.name}' indexed into vector store!` });
        loadData();
        setActiveTab('schemes');
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSchemes = schemes.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.ministry?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                SchemeWise Admin & Knowledge Indexer
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Manage government schemes, update eligibility criteria, re-index vector embeddings, and monitor n8n automation triggers.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('create')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center space-x-2 transition shadow-lg shadow-blue-600/20 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Scheme</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'schemes'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Scheme Catalog ({schemes.length})
          </button>
          <button
            onClick={() => setActiveTab('n8n')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'n8n'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            n8n Automation Logs ({n8nEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            + Create / Edit Scheme
          </button>
        </div>

        {/* Tab 1: Schemes List */}
        {activeTab === 'schemes' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter schemes by name, ministry, category..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Scheme</th>
                      <th className="py-3 px-4">Ministry / Dept</th>
                      <th className="py-3 px-4">State</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Benefit</th>
                      <th className="py-3 px-4">Official Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredSchemes.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-white">{s.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{s.id}</div>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400">{s.ministry}</td>
                        <td className="py-4 px-4 text-xs">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                            {s.state}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-blue-300">{s.category}</td>
                        <td className="py-4 px-4 text-xs text-emerald-400 font-medium">
                          {s.benefits?.length > 40 ? s.benefits.substring(0, 40) + '...' : s.benefits}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <a
                            href={s.official_source}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: n8n Automation Logs */}
        {activeTab === 'n8n' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>n8n Webhook Trigger Event Stream</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time payloads dispatched upon citizen Human-in-the-Loop approvals.
                </p>
              </div>
              <button
                onClick={loadData}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {n8nEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No n8n events recorded yet. Confirm an application in the AI Assistant to trigger webhook automation.
              </div>
            ) : (
              <div className="space-y-4">
                {n8nEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-emerald-400 font-mono">
                        EVENT ID: {evt.event_id}
                      </span>
                      <span className="text-slate-500">{evt.timestamp}</span>
                    </div>
                    <div className="text-slate-300">
                      <strong>Scheme:</strong> {evt.scheme_name} | <strong>Application ID:</strong>{' '}
                      {evt.application_id}
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-slate-400 overflow-x-auto">
                      {JSON.stringify(evt.payload, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Create / Edit Scheme */}
        {activeTab === 'create' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Add Scheme to Knowledge Base & Vector Index</h2>

            {statusMsg && (
              <div
                className={`p-4 rounded-xl mb-4 text-xs font-medium ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                    : 'bg-red-950/60 text-red-300 border border-red-700/50'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateScheme} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Scheme Identifier (Slug)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pm-vidyalaxmi"
                    value={newScheme.id}
                    onChange={(e) => setNewScheme({ ...newScheme, id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Short Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PM Vidyalaxmi"
                    value={newScheme.short_name}
                    onChange={(e) => setNewScheme({ ...newScheme, short_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Full Official Scheme Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PM Vidyalaxmi Higher Education Loan Scheme"
                  value={newScheme.name}
                  onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Ministry / Department</label>
                  <input
                    type="text"
                    required
                    value={newScheme.ministry}
                    onChange={(e) => setNewScheme({ ...newScheme, ministry: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">State (or 'All India')</label>
                  <input
                    type="text"
                    required
                    value={newScheme.state}
                    onChange={(e) => setNewScheme({ ...newScheme, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category</label>
                  <input
                    type="text"
                    required
                    value={newScheme.category}
                    onChange={(e) => setNewScheme({ ...newScheme, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newScheme.description}
                  onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Benefits Description</label>
                  <input
                    type="text"
                    required
                    value={newScheme.benefits}
                    onChange={(e) => setNewScheme({ ...newScheme, benefits: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Annual Income Ceiling (₹)</label>
                  <input
                    type="number"
                    value={newScheme.max_income}
                    onChange={(e) => setNewScheme({ ...newScheme, max_income: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Required Documents (Comma-separated)
                </label>
                <input
                  type="text"
                  value={newScheme.required_documents}
                  onChange={(e) => setNewScheme({ ...newScheme, required_documents: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Official Portal URL</label>
                <input
                  type="url"
                  required
                  value={newScheme.official_source}
                  onChange={(e) => setNewScheme({ ...newScheme, official_source: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-blue-600/30 text-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Indexing into Vector Store...' : 'Index & Publish Scheme'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
