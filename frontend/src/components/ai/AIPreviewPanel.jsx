// src/components/ai/AIPreviewPanel.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const AIPreviewPanel = ({ payload, editedPayload, onEdit, onSendToQueue, loading }) => {
  const { darkMode } = useTheme();
  const [tab, setTab] = useState('preview');
  const [editText, setEditText] = useState(
    JSON.stringify(editedPayload || payload, null, 2)
  );

  const handleEditChange = (val) => {
    setEditText(val);
    try {
      onEdit(JSON.parse(val));
    } catch (_) {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border shadow-xl overflow-hidden ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* AI Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 flex items-center gap-2 text-sm text-white font-medium">
        <span>✨</span>
        <span>AI-generated — review before publishing</span>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {['preview', 'edit'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'preview' ? '👁 Preview' : '✏️ Edit'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {tab === 'preview' ? (
          <pre className={`text-xs overflow-auto max-h-96 rounded-xl p-4 font-mono ${
            darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'
          }`}>
            {JSON.stringify(editedPayload || payload, null, 2)}
          </pre>
        ) : (
          <textarea
            value={editText}
            onChange={e => handleEditChange(e.target.value)}
            rows={18}
            className={`w-full text-xs font-mono rounded-xl p-4 outline-none resize-none border transition-colors ${
              darkMode
                ? 'bg-gray-800 text-gray-200 border-gray-600 focus:border-indigo-500'
                : 'bg-gray-50 text-gray-800 border-gray-300 focus:border-indigo-500'
            }`}
          />
        )}
      </div>

      {/* Actions */}
      <div className={`px-6 pb-6 flex justify-end gap-3`}>
        <button
          onClick={onSendToQueue}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Saving…' : '📥 Send to Queue'}
        </button>
      </div>
    </motion.div>
  );
};

export default AIPreviewPanel;
