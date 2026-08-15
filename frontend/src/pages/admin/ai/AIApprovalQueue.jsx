// src/pages/admin/ai/AIApprovalQueue.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, CloudArrowUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../../../context/ThemeContext';
import AIStatusBadge from '../../../components/ai/AIStatusBadge';

const API = 'http://localhost:5000/api/ai-recommendations';

const TYPE_LABELS = {
  jobRole: 'Job Role', skill: 'Skills', weightage: 'Weightage',
  dependency: 'Dependencies', competency: 'Competency', assessment: 'Assessment', forecast: 'Forecast',
};

const AIApprovalQueue = () => {
  const { darkMode } = useTheme();
  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', type: '' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, ...filter }).toString();
      const res = await axios.get(`${API}/queue?${params}`, { headers });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const doAction = async (action, id, extra = {}) => {
    setActionLoading(action + id);
    try {
      await axios.put(`${API}/queue/${id}/${action}`, extra, { headers });
      showToast(`✅ ${action.charAt(0).toUpperCase() + action.slice(1)} successful!`);
      setSelected(null);
      fetchQueue();
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || 'Action failed'}`);
    } finally { setActionLoading(''); }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Delete this recommendation?')) return;
    setActionLoading('delete' + id);
    try {
      await axios.delete(`${API}/queue/${id}`, { headers });
      showToast('🗑️ Deleted successfully');
      setSelected(null);
      fetchQueue();
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || 'Delete failed'}`);
    } finally { setActionLoading(''); }
  };

  const base = `rounded-3xl border shadow-sm ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200'}`;

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 transition-all duration-500 ${
      darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white'
               : 'bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-gray-900'
    }`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-3">
          <SparklesIcon className="w-3.5 h-3.5" /> Career Intelligence
        </span>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          AI Approval Queue
        </h1>
        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Review, approve, and publish AI-generated recommendations. Total: <strong>{total}</strong>
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['', 'ai_generated', 'under_review', 'approved', 'rejected', 'published'].map(s => (
          <button key={s} onClick={() => { setFilter(f => ({ ...f, status: s })); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter.status === s
                ? 'bg-indigo-500 text-white'
                : darkMode ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
        <select
          value={filter.type}
          onChange={e => { setFilter(f => ({ ...f, type: e.target.value })); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
            darkMode ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-600'
          }`}
        >
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="xl:col-span-2 space-y-3">
          {loading && [...Array(4)].map((_, i) => (
            <div key={i} className={`h-20 rounded-2xl animate-pulse ${darkMode ? 'bg-gray-800/40' : 'bg-gray-200/60'}`} />
          ))}
          {!loading && items.length === 0 && (
            <div className={`${base} p-12 text-center`}>
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-50" />
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No recommendations found</p>
            </div>
          )}
          {items.map(item => (
            <motion.div key={item._id} layout
              onClick={() => setSelected(item)}
              className={`${base} p-4 cursor-pointer transition-all hover:shadow-md ${
                selected?._id === item._id ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>{TYPE_LABELS[item.type] || item.type}</span>
                    <AIStatusBadge status={item.status} />
                  </div>
                  <p className="text-sm font-medium truncate">{item.prompt}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(item.createdAt).toLocaleDateString()} · {item.generatedBy}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {item.status !== 'approved' && item.status !== 'published' && item.status !== 'rejected' && (
                    <button onClick={e => { e.stopPropagation(); doAction('approve', item._id); }}
                      disabled={!!actionLoading}
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                      title="Approve">
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                  )}
                  {item.status === 'approved' && (
                    <button onClick={e => { e.stopPropagation(); doAction('publish', item._id); }}
                      disabled={!!actionLoading}
                      className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition"
                      title="Publish">
                      <CloudArrowUpIcon className="w-4 h-4" />
                    </button>
                  )}
                  {!['published'].includes(item.status) && (
                    <button onClick={e => { e.stopPropagation(); doDelete(item._id); }}
                      disabled={!!actionLoading}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                      title="Delete">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          <div className="flex justify-center gap-2 pt-4">
            {page > 1 && <button onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 text-sm font-semibold hover:bg-indigo-500/20">← Prev</button>}
            {items.length === 15 && <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 text-sm font-semibold hover:bg-indigo-500/20">Next →</button>}
          </div>
        </div>

        {/* Detail Panel */}
        <div>
          {selected ? (
            <motion.div key={selected._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`${base} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Review Detail</h3>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300 text-lg">×</button>
              </div>
              <div className="space-y-3 mb-4">
                <div><span className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Type</span><p className="text-sm font-medium">{TYPE_LABELS[selected.type]}</p></div>
                <div><span className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Status</span><div className="mt-1"><AIStatusBadge status={selected.status} /></div></div>
                <div><span className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Prompt</span><p className="text-sm mt-1">{selected.prompt}</p></div>
                {selected.adminNotes && <div><span className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Notes</span><p className="text-xs mt-1 text-amber-400">{selected.adminNotes}</p></div>}
              </div>

              <pre className={`text-xs overflow-auto max-h-48 rounded-xl p-3 mb-4 font-mono ${
                darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
              }`}>
                {JSON.stringify(selected.editedPayload || selected.payload, null, 2)}
              </pre>

              {/* Actions */}
              <div className="space-y-2">
                {!['approved', 'published', 'rejected'].includes(selected.status) && (
                  <button onClick={() => doAction('approve', selected._id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-semibold transition">
                    <CheckCircleIcon className="w-4 h-4" /> Approve
                  </button>
                )}
                {selected.status === 'approved' && (
                  <button onClick={() => doAction('publish', selected._id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-sm font-semibold transition">
                    <CloudArrowUpIcon className="w-4 h-4" /> Publish Now
                  </button>
                )}
                {!['published', 'rejected'].includes(selected.status) && (
                  showRejectInput ? (
                    <div className="space-y-2">
                      <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                        placeholder="Rejection reason…"
                        className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                          darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                        }`} />
                      <button onClick={() => { doAction('reject', selected._id, { reason: rejectReason }); setShowRejectInput(false); }}
                        className="w-full py-2 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-semibold hover:bg-rose-500/20 transition">
                        Confirm Reject
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowRejectInput(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm font-semibold transition">
                      <XCircleIcon className="w-4 h-4" /> Reject
                    </button>
                  )
                )}
              </div>
            </motion.div>
          ) : (
            <div className={`${base} p-8 text-center`}>
              <SparklesIcon className={`w-10 h-10 mx-auto mb-3 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select a recommendation to review</p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-gray-800 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold border border-gray-700">
          {toast}
        </motion.div>
      )}
    </div>
  );
};

export default AIApprovalQueue;
