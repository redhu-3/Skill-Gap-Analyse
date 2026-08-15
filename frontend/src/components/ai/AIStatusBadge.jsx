// src/components/ai/AIStatusBadge.jsx
import React from 'react';

const STATUS_CONFIG = {
  draft:        { label: 'Draft',        color: 'bg-gray-500/20 text-gray-400', dot: 'bg-gray-400' },
  ai_generated: { label: 'AI Generated', color: 'bg-violet-500/20 text-violet-400', dot: 'bg-violet-400' },
  under_review: { label: 'Under Review', color: 'bg-amber-500/20 text-amber-400', dot: 'bg-amber-400' },
  approved:     { label: 'Approved',     color: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
  rejected:     { label: 'Rejected',     color: 'bg-rose-500/20 text-rose-400', dot: 'bg-rose-400' },
  published:    { label: 'Published',    color: 'bg-sky-500/20 text-sky-400', dot: 'bg-sky-400' },
};

const AIStatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default AIStatusBadge;
