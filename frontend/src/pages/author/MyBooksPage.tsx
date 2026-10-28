import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Coins,
  Copy,
  ExternalLink,
  HelpCircle,
  Layers,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { Book } from '../../types';
import { BookCoverPlaceholder } from '../../components/ui/BookCoverPlaceholder';
import { Badge } from '../../components/ui/Badge';

export const MyBooksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [copiedIsbn, setCopiedIsbn] = useState<string | null>(null);

  const { data: books, isLoading } = useQuery({
    queryKey: ['authorBooks', searchTerm, statusFilter],
    queryFn: () => api.getAuthorBooks({ search: searchTerm, status: statusFilter }),
  });

  const formatCurrency = (val?: number | null) => {
    if (val === null || val === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopyIsbn = (isbn: string) => {
    navigator.clipboard.writeText(isbn);
    setCopiedIsbn(isbn);
    setTimeout(() => setCopiedIsbn(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-leaf-800 font-semibold">
              Author Catalog
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500">
              {books ? `${books.length} Total Titles` : 'Loading...'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            My Published & In-Production Titles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans max-w-2xl">
            Track title sales velocity, verified inventory, royalty disbursements, and distribution channels across India & US.
          </p>
        </div>

        <button
          onClick={() => navigate('/author/submit-query')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-leaf-900 text-white font-medium text-xs sm:text-sm hover:bg-leaf-800 transition-colors shadow-xs self-start"
        >
          <HelpCircle className="w-4 h-4 text-amber-gold" />
          <span>Raise a Query</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, genre, or ISBN..."
            className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-leaf-600/20 focus:border-leaf-700 bg-stone-50/50 text-slate-900 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'Published', 'Production'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all duration-150 shrink-0 ${
                statusFilter === status
                  ? 'bg-leaf-900 text-white shadow-xs font-semibold'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200/80'
              }`}
            >
              {status === 'all' ? 'All Titles' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-white rounded-3xl border border-stone-200/80" />
          ))}
        </div>
      ) : !books || books.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-slate-800">No books found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or status filter to see other catalog titles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {books.map((book) => {
            const isProduction = book.status.toLowerCase().includes('production');
            return (
              <div
                key={book.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start space-x-4 sm:space-x-5">
                    {/* Hardcover Book Cover Placeholder */}
                    <BookCoverPlaceholder
                      title={book.title}
                      genre={book.genre}
                      status={book.status}
                      className="w-24 sm:w-28 h-36 sm:h-40 shrink-0"
                    />

                    {/* Book Metadata Header */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] font-mono text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/60">
                          {book.book_id}
                        </span>
                        <Badge
                          variant="status"
                          value={isProduction ? 'in progress' : 'open'}
                          size="sm"
                        >
                          {book.status}
                        </Badge>
                      </div>

                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-leaf-950 transition-colors">
                        {book.title}
                      </h3>

                      <div className="flex items-center space-x-2 text-xs text-slate-500 font-sans flex-wrap">
                        <span>{book.genre || 'Literature'}</span>
                        <span>&bull;</span>
                        <div className="flex items-center space-x-1">
                          <span className="font-mono text-slate-600">
                            {book.isbn || 'Pending ISBN'}
                          </span>
                          {book.isbn && (
                            <button
                              onClick={() => handleCopyIsbn(book.isbn!)}
                              title="Copy ISBN"
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                            >
                              {copiedIsbn === book.isbn ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-slate-600 pt-1 flex-wrap gap-y-1">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {book.publication_date ? `Pub: ${book.publication_date}` : 'Target: In Production'}
                        </span>
                        <span>
                          MRP: <strong className="text-slate-900">{formatCurrency(book.mrp)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Performance Stats Bar */}
                  <div className="mt-5 grid grid-cols-4 gap-2 p-3 bg-stone-50/80 rounded-2xl border border-stone-200/60 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Copies Sold</span>
                      <span className="font-serif font-bold text-slate-900 text-sm mt-0.5 block tabular-nums">
                        {book.total_copies_sold}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Royalty</span>
                      <span className="font-serif font-bold text-slate-900 text-sm mt-0.5 block tabular-nums">
                        {formatCurrency(book.total_royalty_earned)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Royalty Paid</span>
                      <span className="font-serif font-bold text-emerald-700 text-sm mt-0.5 block tabular-nums">
                        {formatCurrency(book.royalty_paid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pending</span>
                      <span className="font-serif font-bold text-amber-800 text-sm mt-0.5 block tabular-nums">
                        {formatCurrency(book.royalty_pending)}
                      </span>
                    </div>
                  </div>

                  {/* Distribution Channels & Print Partner */}
                  <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Channels:</span>
                      {book.available_on && book.available_on.length > 0 ? (
                        book.available_on.map((ch) => (
                          <span
                            key={ch}
                            className="text-[10px] bg-white border border-stone-200/80 text-slate-700 px-2 py-0.5 rounded-md font-sans shadow-2xs"
                          >
                            {ch}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] italic text-slate-400">Distribution pipeline pending</span>
                      )}
                    </div>
                    {book.print_partner && (
                      <span className="text-[11px] text-slate-400 shrink-0">
                        Print: {book.print_partner}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="text-xs font-semibold text-leaf-800 hover:text-leaf-950 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Audit Breakdown</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => navigate(`/author/submit-query?book_id=${book.book_id}`)}
                    className="text-xs font-medium text-slate-600 hover:text-leaf-900 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-leaf-300 hover:bg-leaf-50/50 transition-all flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-leaf-700" />
                    <span>Raise Query for this Title</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Detail Modal / Drawer */}
      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/60">
                  {selectedBook.book_id}
                </span>
                <h2 className="text-xl font-serif font-bold text-slate-900 mt-1.5">
                  {selectedBook.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ISBN: <span className="font-mono">{selectedBook.isbn || 'Pending Assignment'}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl text-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
                BookLeaf 80/20 Royalty Audit Summary
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-slate-600">Retail MRP</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(selectedBook.mrp)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-slate-600">Author Royalty Share Per Copy</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(selectedBook.author_royalty_per_copy)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-slate-600">Verified Copies Sold (Net of Returns)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{selectedBook.total_copies_sold}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-slate-600">Total Royalty Earned (80% Net Profit)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(selectedBook.total_royalty_earned)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-slate-600">Disbursed to Linked Bank Account</span>
                  <span className="font-semibold text-emerald-700 tabular-nums">{formatCurrency(selectedBook.royalty_paid)}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-stone-100 bg-amber-50/70 px-3 rounded-xl">
                  <span className="font-semibold text-amber-950">Pending Bank Disbursement</span>
                  <span className="font-bold text-amber-950 tabular-nums">{formatCurrency(selectedBook.royalty_pending)}</span>
                </div>
                <div className="flex justify-between py-2 text-slate-600">
                  <span>Last Payout Date:</span>
                  <span className="font-mono text-slate-800">
                    {selectedBook.last_royalty_payout_date || 'No disbursement cycle completed yet'}
                  </span>
                </div>
              </div>

              {selectedBook.royalty_pending > 0 && selectedBook.royalty_pending < 1000 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 leading-relaxed">
                  ℹ️ This pending amount is below BookLeaf's minimum ₹1,000 threshold and will automatically disburse in the next quarter once accumulated.
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-stone-100">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedBook(null);
                  navigate(`/author/submit-query?book_id=${selectedBook.book_id}`);
                }}
                className="px-4 py-2 bg-leaf-900 hover:bg-leaf-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                Raise Query for this Title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
