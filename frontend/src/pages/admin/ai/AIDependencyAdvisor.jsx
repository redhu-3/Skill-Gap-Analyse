// src/pages/admin/ai/AIDependencyAdvisor.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LinkIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../../../context/ThemeContext';
import AIGenerateButton from '../../../components/ai/AIGenerateButton';
import AIPreviewPanel from '../../../components/ai/AIPreviewPanel';

const API = 'http://localhost:5000';

const AIDependencyAdvisor = () => {
  const { darkMode } = useTheme();
  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  const [jobRoles, setJobRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [editedPayload, setEditedPayload] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    axios.get(`${API}/api/job-roles`, { headers }).then(r => setJobRoles(r.data.jobRoles || r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedRole) return;
    axios.get(`${API}/api/skills/job-role/${selectedRole}`, { headers })
      .then(r => setSkills(r.data.skills || r.data || []))
      .catch(() => {});
  }, [selectedRole]);

  const handleGenerate = async () => {
    if (!selectedSkill) { setError('Please select a skill'); return; }
    setError(''); setLoading(true); setRecommendation(null);
    try {
      const res = await axios.post(`${API}/api/ai-recommendations/generate/dependencies/${selectedSkill}`, {}, { headers });
      setRecommendation(res.data.recommendation);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed');
    } finally { setLoading(false); }
  };

  const handleSendToQueue = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/ai-recommendations/queue/${recommendation._id}/edit`,
        { editedPayload: editedPayload || recommendation.payload }, { headers });
      showToast('✅ Sent to Approval Queue!');
      setRecommendation(null);
    } catch (err) { setError('Failed to save'); } finally { setSaving(false); }
  };

  const base = `rounded-3xl border shadow-sm p-6 ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200'}`;

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 ${darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white' : 'bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-gray-900'}`}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-3">
          <SparklesIcon className="w-3.5 h-3.5" /> Career Intelligence
        </span>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI Dependency Advisor</h1>
        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Suggest prerequisite relationships for any skill automatically.</p>
      </motion.div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={base}>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-violet-400" /> Select Skill</h2>
          {error && <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 text-sm">{error}</div>}
          <div className="space-y-3 mb-4">
            <select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); setSelectedSkill(''); }}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
              <option value="">Select a job role first…</option>
              {jobRoles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} disabled={!selectedRole}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none disabled:opacity-50 ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
              <option value="">Select a skill…</option>
              {skills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <AIGenerateButton onClick={handleGenerate} loading={loading} label="Suggest Dependencies" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {recommendation ? (
            <AIPreviewPanel payload={recommendation.payload} editedPayload={editedPayload} onEdit={setEditedPayload} onSendToQueue={handleSendToQueue} loading={saving} />
          ) : (
            <div className={`${base} flex flex-col items-center justify-center h-48 text-center`}>
              <LinkIcon className={`w-10 h-10 mb-3 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select a skill to get dependency suggestions.</p>
            </div>
          )}
        </motion.div>
      </div>
      {toast && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 right-6 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold">{toast}</motion.div>}
    </div>
  );
};

export default AIDependencyAdvisor;
