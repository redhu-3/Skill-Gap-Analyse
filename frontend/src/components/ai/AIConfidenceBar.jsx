// src/components/ai/AIConfidenceBar.jsx
import React from 'react';

const AIConfidenceBar = ({ score = 0 }) => {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'from-emerald-500 to-emerald-400'
    : pct >= 60 ? 'from-amber-500 to-amber-400'
    : 'from-rose-500 to-rose-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-400 min-w-[2.5rem] text-right">{pct}%</span>
    </div>
  );
};

export default AIConfidenceBar;
