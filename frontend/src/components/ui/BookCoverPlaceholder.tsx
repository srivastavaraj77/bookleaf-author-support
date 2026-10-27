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
  // Determine color scheme based on genre or status
  const isProduction = status.includes('Production');

  let bgClass = 'from-slate-800 to-navy-950 text-slate-100';
  let accentBar = 'bg-amber-400';

  if (isProduction) {
    bgClass = 'from-amber-900 via-stone-800 to-stone-900 text-amber-100';
    accentBar = 'bg-amber-500';
  } else if (genre?.includes('Fiction')) {
    bgClass = 'from-leaf-900 via-slate-900 to-navy-950 text-leaf-100';
    accentBar = 'bg-leaf-400';
  } else if (genre?.includes('Poetry')) {
    bgClass = 'from-purple-950 via-slate-900 to-navy-950 text-purple-100';
    accentBar = 'bg-purple-300';
  } else if (genre?.includes('Thriller')) {
    bgClass = 'from-rose-950 via-slate-900 to-black text-rose-100';
    accentBar = 'bg-rose-500';
  } else if (genre?.includes('Romance')) {
    bgClass = 'from-pink-950 via-slate-900 to-stone-900 text-pink-100';
    accentBar = 'bg-pink-300';
  }

  return (
    <div
      className={`relative rounded-md overflow-hidden bg-gradient-to-br ${bgClass} shadow-md flex flex-col justify-between p-2.5 border border-white/10 ${className}`}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-black/30 shadow-inner" />
      <div className={`w-6 h-0.5 ${accentBar} mb-1 opacity-80`} />
      <div className="my-auto text-center px-1">
        <p className="font-serif text-[11px] font-bold line-clamp-3 leading-tight tracking-wide">
          {title}
        </p>
        {genre && (
          <p className="text-[8px] uppercase tracking-wider text-white/60 mt-1 line-clamp-1 font-sans">
            {genre}
          </p>
        )}
      </div>
      <div className="text-[7px] tracking-widest uppercase text-white/50 text-center font-mono">
        BookLeaf
      </div>
    </div>
  );
};
