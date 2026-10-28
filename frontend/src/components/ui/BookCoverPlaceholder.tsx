import React from 'react';

interface BookCoverProps {
  title: string;
  genre?: string | null;
  status: string;
  className?: string;
}

export const BookCoverPlaceholder: React.FC<BookCoverProps> = ({
  title,
  genre,
  status,
  className = 'w-24 h-36',
}) => {
  const isProduction = status.toLowerCase().includes('production');

  // Realistic publisher cover styles
  let coverBg = 'from-emerald-950 via-slate-900 to-navy-950 text-emerald-50';
  let foilLine = 'bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400';
  let badgeColor = 'bg-emerald-900/60 text-emerald-200 border-emerald-500/30';

  if (isProduction) {
    coverBg = 'from-stone-900 via-amber-950/80 to-stone-950 text-amber-50';
    foilLine = 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500';
    badgeColor = 'bg-amber-950/70 text-amber-300 border-amber-600/40';
  } else if (genre?.includes('Poetry')) {
    coverBg = 'from-purple-950 via-slate-900 to-navy-950 text-purple-50';
    foilLine = 'bg-gradient-to-r from-purple-300 via-pink-200 to-purple-300';
    badgeColor = 'bg-purple-900/60 text-purple-200 border-purple-500/30';
  } else if (genre?.includes('Fiction') || genre?.includes('Historical')) {
    coverBg = 'from-stone-900 via-leaf-950 to-slate-950 text-leaf-50';
    foilLine = 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400';
    badgeColor = 'bg-leaf-900/60 text-leaf-200 border-leaf-500/30';
  } else if (genre?.includes('Romance')) {
    coverBg = 'from-rose-950 via-stone-900 to-slate-950 text-rose-50';
    foilLine = 'bg-gradient-to-r from-rose-300 via-pink-200 to-rose-300';
    badgeColor = 'bg-rose-900/60 text-rose-200 border-rose-500/30';
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-gradient-to-br ${coverBg} shadow-card flex flex-col justify-between p-3 border border-white/10 shrink-0 select-none group transition-transform duration-200 ${className}`}
    >
      {/* Book spine crease effect */}
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/40 via-black/20 to-transparent shadow-inner" />
      <div className="absolute inset-y-0 left-1.5 w-0.5 bg-white/10" />

      {/* Top Foil Accent Bar */}
      <div className="flex items-center justify-between">
        <div className={`w-6 h-0.5 rounded-full ${foilLine} opacity-90`} />
        {isProduction && (
          <span className="text-[8px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
            DRAFT
          </span>
        )}
      </div>

      {/* Center Title & Genre */}
      <div className="my-auto text-center px-1 py-1">
        <p className="font-serif text-[11px] sm:text-xs font-bold line-clamp-3 leading-snug tracking-wide text-white drop-shadow-xs">
          {title}
        </p>
        {genre && (
          <span
            className={`inline-block mt-1.5 text-[8px] uppercase tracking-widest font-sans px-1.5 py-0.5 rounded-full border ${badgeColor}`}
          >
            {genre}
          </span>
        )}
      </div>

      {/* Publisher Imprint Bottom */}
      <div className="pt-1 border-t border-white/10 text-center">
        <span className="text-[7px] tracking-widest uppercase text-white/50 font-mono">
          BOOKLEAF
        </span>
      </div>
    </div>
  );
};
