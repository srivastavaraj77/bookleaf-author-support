import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'priority' | 'status' | 'category' | 'default';
  value?: string;
  size?: 'sm' | 'md';
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  value,
  size = 'md',
  withDot = true,
}) => {
  const val = (value || children)?.toString().toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let dotColor = 'bg-slate-400';

  if (variant === 'priority') {
    if (val === 'critical') {
      colorClasses = 'bg-rose-50/90 text-rose-700 border-rose-200 font-semibold shadow-xs';
      dotColor = 'bg-rose-500 animate-pulse';
    } else if (val === 'high') {
      colorClasses = 'bg-amber-50/90 text-amber-800 border-amber-200 font-medium';
      dotColor = 'bg-amber-500';
    } else if (val === 'medium') {
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
      dotColor = 'bg-sky-500';
    } else if (val === 'low') {
      colorClasses = 'bg-slate-50 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
    }
  } else if (variant === 'status') {
    if (val === 'open') {
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
      dotColor = 'bg-emerald-500';
    } else if (val === 'in progress') {
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium';
      dotColor = 'bg-indigo-500';
    } else if (val === 'resolved') {
      colorClasses = 'bg-teal-50 text-teal-800 border-teal-200';
      dotColor = 'bg-teal-500';
    } else if (val === 'closed') {
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
    }
  } else if (variant === 'category') {
    if (val?.includes('royalty')) {
      colorClasses = 'bg-emerald-50/90 text-emerald-900 border-emerald-200/90 font-medium';
      dotColor = 'bg-emerald-600';
    } else if (val?.includes('isbn')) {
      colorClasses = 'bg-violet-50 text-violet-800 border-violet-200 font-medium';
      dotColor = 'bg-violet-500';
    } else if (val?.includes('printing')) {
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      dotColor = 'bg-amber-500';
    } else if (val?.includes('distribution')) {
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-200 font-medium';
      dotColor = 'bg-sky-500';
    } else if (val?.includes('production')) {
      colorClasses = 'bg-amber-50/90 text-amber-900 border-amber-200 font-medium';
      dotColor = 'bg-amber-600';
    } else {
      colorClasses = 'bg-stone-50 text-stone-700 border-stone-200 font-medium';
      dotColor = 'bg-stone-400';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${colorClasses} tracking-tight font-sans transition-all duration-150`}
    >
      {withDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span className="truncate">{children}</span>
    </span>
  );
};
