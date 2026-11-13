import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = (status || '').toUpperCase();

  let styles = 'bg-slate-100/80 text-slate-700 border-slate-200/80';
  let dotColor = 'bg-slate-400';

  if (['APPROVED', 'CONNECTED', 'ACTIVE', 'DELIVERED', 'READ', 'OPTED_IN', 'PAID', 'SUCCESS', 'COMPLETED'].includes(norm)) {
    styles = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
    dotColor = 'bg-emerald-500';
  } else if (['PENDING', 'SCHEDULED', 'QUEUED', 'PROCESSING'].includes(norm)) {
    styles = 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    dotColor = 'bg-amber-500 animate-pulse';
  } else if (['REJECTED', 'DISCONNECTED', 'FAILED', 'OPTED_OUT', 'SUSPENDED', 'OVERDUE', 'ERROR'].includes(norm)) {
    styles = 'bg-rose-500/10 text-rose-700 border-rose-500/30';
    dotColor = 'bg-rose-500';
  } else if (['SENT', 'DRAFT'].includes(norm)) {
    styles = 'bg-sky-500/10 text-sky-700 border-sky-500/30';
    dotColor = 'bg-sky-500';
  } else if (['PAUSED'].includes(norm)) {
    styles = 'bg-purple-500/10 text-purple-700 border-purple-500/30';
    dotColor = 'bg-purple-500';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${dotColor}`}></span>
      <span className="tracking-wide uppercase">{norm.replace('_', ' ')}</span>
    </span>
  );
};
