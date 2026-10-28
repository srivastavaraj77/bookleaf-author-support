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
  const iconTheme = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }[accentColor];

  const topBarColor = {
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-600',
    slate: 'bg-slate-400',
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-card transition-all duration-200 overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      {/* Subtle top indicator line on hover */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${topBarColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 font-sans">
            {label}
          </p>
          <div className="mt-2.5 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-[26px] font-serif font-bold text-slate-900 tracking-tight tabular-nums">
              {value}
            </h3>
          </div>
        </div>

        {icon && (
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconTheme}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {subtitle && (
          <p className="text-slate-500 font-sans truncate text-xs">
            {subtitle}
          </p>
        )}
        {badge && <div className="shrink-0 ml-2">{badge}</div>}
      </div>
    </div>
  );
};
