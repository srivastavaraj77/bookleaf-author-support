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

  // Original publishing cover palette: deep ink navy, muted teal, warm charcoal, rich burgundy
  let coverBg = 'bg-ink-950 text-stone-100';
  let ribbonColor = 'bg-teal-500';
  let foilAccent = 'text-brass-300 border-brass-400/40';

  if (isProduction) {
    coverBg = 'bg-stone-900 text-amber-50';
    ribbonColor = 'bg-brass-500';
    foilAccent = 'text-amber-300 border-amber-400/40';
  } else if (genre?.includes('Poetry')) {
    coverBg = 'bg-[#182635] text-teal-50';
    ribbonColor = 'bg-teal-400';
    foilAccent = 'text-teal-200 border-teal-300/40';
  } else if (genre?.includes('Fiction')) {
    coverBg = 'bg-ink-900 text-stone-100';
    ribbonColor = 'bg-brass-400';
    foilAccent = 'text-brass-300 border-brass-400/40';
  } else if (genre?.includes('Thriller')) {
    coverBg = 'bg-[#12161f] text-stone-100';
    ribbonColor = 'bg-rose-500';
    foilAccent = 'text-rose-200 border-rose-400/40';
  }

  return (
    <div
      className={`relative rounded-md overflow-hidden ${coverBg} shadow-card flex flex-col justify-between p-3 border border-white/10 shrink-0 select-none transition-transform duration-200 ${className}`}
    >
      {/* Book spine texture */}
      <div className="absolute inset-y-0 left-0 w-1.5 bg-black/40 shadow-inner" />
      
      {/* Editorial ribbon marker */}
      <div className={`absolute top-0 right-3 w-1.5 h-4 ${ribbonColor} shadow-xs rounded-b-xs`} />

      {/* Title & Imprint */}
      <div className="my-auto pl-1 pr-2 text-left">
        <p className="font-serif text-[11px] sm:text-xs font-bold line-clamp-3 leading-snug tracking-normal text-white">
          {title}
        </p>
        {genre && (
          <span
            className={`inline-block mt-2 text-[8px] uppercase tracking-widest font-mono px-1 py-0.5 rounded border ${foilAccent}`}
          >
            {genre}
          </span>
        )}
      </div>

      {/* Publisher Stamp */}
      <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[7px] tracking-wider uppercase text-white/40 font-mono">
        <span>BOOKLEAF</span>
        {isProduction && <span className="text-brass-400">PROOF</span>}
      </div>
    </div>
  );
};
