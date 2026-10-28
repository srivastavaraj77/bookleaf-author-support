import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  accentColor?: 'teal' | 'brass' | 'rose' | 'ink' | 'slate' | 'emerald' | 'amber' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  badge,
  onClick,
  accentColor = 'teal',
}) => {
  const iconStyle = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200/70',
    brass: 'bg-brass-50 text-brass-700 border-brass-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    ink: 'bg-ink-50 text-ink-800 border-ink-200/80',
    slate: 'bg-stone-100 text-stone-700 border-stone-200',
    emerald: 'bg-teal-50 text-teal-800 border-teal-200/80',
    amber: 'bg-brass-50 text-brass-700 border-brass-200/80',
    indigo: 'bg-ink-50 text-ink-800 border-ink-200/80',
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs hover:shadow-subtle transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-stone-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 font-sans">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-[25px] font-serif font-bold text-ink-950 tracking-tight tabular-nums">
              {value}
            </h3>
          </div>
        </div>

        {icon && (
          <div
            className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${iconStyle}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        {subtitle && (
          <p className="text-stone-500 font-sans truncate text-xs">
            {subtitle}
          </p>
        )}
        {badge && <div className="shrink-0 ml-2">{badge}</div>}
      </div>
    </div>
  );
};
