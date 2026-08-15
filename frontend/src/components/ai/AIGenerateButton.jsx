// src/components/ai/AIGenerateButton.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/solid';

const AIGenerateButton = ({ onClick, loading, label = 'Generate with AI', disabled = false }) => (
  <motion.button
    whileHover={!loading && !disabled ? { scale: 1.02 } : {}}
    whileTap={!loading && !disabled ? { scale: 0.98 } : {}}
    onClick={onClick}
    disabled={loading || disabled}
    className={`
      flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
      transition-all duration-300 shadow-md
      ${loading || disabled
        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25'}
    `}
  >
    {loading ? (
      <>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
        />
        Generating…
      </>
    ) : (
      <>
        <SparklesIcon className="w-4 h-4" />
        {label}
      </>
    )}
  </motion.button>
);

export default AIGenerateButton;
