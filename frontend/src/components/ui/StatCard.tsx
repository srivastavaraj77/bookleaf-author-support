import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  accentColor?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  badge,
  onClick,
  accentColor = 'slate',
}) => {
  const accentBorder = {
    emerald: 'border-l-4 border-l-emerald-600',
    amber: 'border-l-4 border-l-amber-600',
    rose: 'border-l-4 border-l-rose-600',
    indigo: 'border-l-4 border-l-indigo-600',
    slate: 'border-l-4 border-l-slate-400',
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm transition-all hover:shadow-md ${accentBorder} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">{label}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">{value}</h3>
        {badge}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 font-sans">{subtitle}</p>}
    </div>
  );
};

