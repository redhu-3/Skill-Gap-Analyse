// src/pages/admin/ai/AIRoleGenerator.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../../../context/ThemeContext';
import AIGenerateButton from '../../../components/ai/AIGenerateButton';
import AIPreviewPanel from '../../../components/ai/AIPreviewPanel';

const API = 'http://localhost:5000/api/ai-recommendations';

const AIRoleGenerator = () => {
  const { darkMode } = useTheme();
  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  const [form, setForm] = useState({ roleName: '', industry: '', experienceLevel: 'junior' });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [editedPayload, setEditedPayload] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleGenerate = async () => {
    if (!form.roleName.trim()) { setError('Role name is required'); return; }
    setError(''); setLoading(true); setRecommendation(null); setEditedPayload(null);
    try {
      const res = await axios.post(`${API}/generate/job-role`, form, { headers });
      setRecommendation(res.data.recommendation);
    } catch (err) {
      setError(err.response?.data?.message || 'AI generation failed. Try again.');
    } finally { setLoading(false); }
  };

  const handleSendToQueue = async () => {
    if (!recommendation) return;
    setSaving(true);
    try {
      await axios.put(`${API}/queue/${recommendation._id}/edit`,
        { editedPayload: editedPayload || recommendation.payload },
        { headers }
      );
      showToast('✅ Sent to Approval Queue successfully!');
      setRecommendation(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save edits.');
    } finally { setSaving(false); }
  };

  const base = `rounded-3xl border shadow-sm p-6 ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200'}`;

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
          AI Role Generator
        </h1>
        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Generate a complete job role definition from a name. Review and edit before publishing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={base}>
          <h2 className="text-lg font-bold mb-5">Role Details</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 text-sm border border-rose-500/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Role Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Developer, Data Scientist"
                value={form.roleName}
                onChange={e => setForm(p => ({ ...p, roleName: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                  darkMode ? 'bg-gray-900 border-gray-600 text-white focus:border-indigo-500'
                           : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Industry (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Software Development, Finance, Healthcare"
                value={form.industry}
                onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                  darkMode ? 'bg-gray-900 border-gray-600 text-white focus:border-indigo-500'
                           : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Experience Level
              </label>
              <select
                value={form.experienceLevel}
                onChange={e => setForm(p => ({ ...p, experienceLevel: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                  darkMode ? 'bg-gray-900 border-gray-600 text-white'
                           : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              >
                {['beginner', 'junior', 'mid', 'senior'].map(l => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>

            <AIGenerateButton onClick={handleGenerate} loading={loading} />
          </div>
        </motion.div>

        {/* Preview Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {recommendation ? (
            <AIPreviewPanel
              payload={recommendation.payload}
              editedPayload={editedPayload}
              onEdit={setEditedPayload}
              onSendToQueue={handleSendToQueue}
              loading={saving}
            />
          ) : (
            <div className={`${base} flex flex-col items-center justify-center h-64 text-center`}>
              <SparklesIcon className={`w-12 h-12 mb-3 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Enter a role name and click <strong>Generate with AI</strong> to see the preview here.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
};

export default AIRoleGenerator;
