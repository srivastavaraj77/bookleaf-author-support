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

  let colorClasses = 'bg-stone-100 text-stone-700 border-stone-200/80';
  let dotColor = 'bg-stone-400';

  if (variant === 'priority') {
    if (val === 'critical') {
      colorClasses = 'bg-rose-50/90 text-rose-800 border-rose-200 font-semibold shadow-2xs';
      dotColor = 'bg-rose-500 animate-pulse';
    } else if (val === 'high') {
      colorClasses = 'bg-brass-50 text-brass-900 border-brass-200/90 font-medium';
      dotColor = 'bg-brass-500';
    } else if (val === 'medium') {
      colorClasses = 'bg-teal-50 text-teal-850 border-teal-200/80 font-medium';
      dotColor = 'bg-teal-600';
    } else if (val === 'low') {
      colorClasses = 'bg-stone-50 text-stone-600 border-stone-200';
      dotColor = 'bg-stone-400';
    }
  } else if (variant === 'status') {
    if (val === 'open') {
      colorClasses = 'bg-teal-50 text-teal-900 border-teal-200 font-semibold';
      dotColor = 'bg-teal-500';
    } else if (val === 'in progress') {
      colorClasses = 'bg-ink-50 text-ink-900 border-ink-200 font-semibold';
      dotColor = 'bg-ink-600';
    } else if (val === 'resolved') {
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
      dotColor = 'bg-emerald-500';
    } else if (val === 'closed') {
      colorClasses = 'bg-stone-100 text-stone-600 border-stone-200';
      dotColor = 'bg-stone-400';
    }
  } else if (variant === 'category') {
    if (val?.includes('royalty')) {
      colorClasses = 'bg-brass-50/90 text-brass-900 border-brass-200/90 font-medium';
      dotColor = 'bg-brass-600';
    } else if (val?.includes('isbn')) {
      colorClasses = 'bg-purple-50 text-purple-800 border-purple-200 font-medium';
      dotColor = 'bg-purple-500';
    } else if (val?.includes('printing')) {
      colorClasses = 'bg-amber-50 text-amber-900 border-amber-200 font-medium';
      dotColor = 'bg-amber-600';
    } else if (val?.includes('distribution')) {
      colorClasses = 'bg-teal-50 text-teal-800 border-teal-200 font-medium';
      dotColor = 'bg-teal-600';
    } else if (val?.includes('production')) {
      colorClasses = 'bg-ink-50 text-ink-900 border-ink-200 font-medium';
      dotColor = 'bg-ink-600';
    } else {
      colorClasses = 'bg-stone-50 text-stone-700 border-stone-200 font-medium';
      dotColor = 'bg-stone-400';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClasses} ${colorClasses} tracking-tight font-sans transition-all`}
    >
      {withDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span className="truncate">{children}</span>
    </span>
  );
};
