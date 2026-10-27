import React from 'react';
import { TicketPriority, TicketStatus, TicketCategory } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'priority' | 'status' | 'category' | 'default';
  value?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  value,
  size = 'md',
}) => {
  const val = (value || children)?.toString().toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (variant === 'priority') {
    if (val === 'critical') {
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold animate-pulse';
    } else if (val === 'high') {
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    } else if (val === 'medium') {
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (val === 'low') {
      colorClasses = 'bg-slate-50 text-slate-600 border-slate-200';
    }
  } else if (variant === 'status') {
    if (val === 'open') {
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
    } else if (val === 'in progress') {
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium';
    } else if (val === 'resolved') {
      colorClasses = 'bg-teal-50 text-teal-800 border-teal-200';
    } else if (val === 'closed') {
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
    }
  } else if (variant === 'category') {
    if (val?.includes('royalty')) {
      colorClasses = 'bg-emerald-50 text-emerald-900 border-emerald-200';
    } else if (val?.includes('isbn')) {
      colorClasses = 'bg-purple-50 text-purple-800 border-purple-200';
    } else if (val?.includes('printing')) {
      colorClasses = 'bg-orange-50 text-orange-800 border-orange-200';
    } else if (val?.includes('distribution')) {
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
    } else if (val?.includes('production')) {
      colorClasses = 'bg-amber-50 text-amber-900 border-amber-200';
    } else {
      colorClasses = 'bg-stone-100 text-stone-700 border-stone-200';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses} ${colorClasses} tracking-tight font-sans transition-colors`}
    >
      {children}
    </span>
  );
};
