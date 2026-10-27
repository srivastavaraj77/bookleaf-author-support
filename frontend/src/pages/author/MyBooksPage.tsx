import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  ExternalLink,
  HelpCircle,
  Layers,
  Search,
  ShoppingBag,
  SlidersHorizontal,
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

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">My Published & In-Production Titles</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            Manage your BookLeaf catalog, sales performance, royalty disbursements, and distribution channels.
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
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or ISBN..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Status:
          </span>
          {['all', 'Published', 'Production'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors shrink-0 ${
                statusFilter === status
                  ? 'bg-leaf-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'All Titles' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : !books || books.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-slate-800">No books found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {books.map((book) => {
            const isProduction = book.status.includes('Production');
            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start space-x-4">
                    {/* Cover Art */}
                    <BookCoverPlaceholder
                      title={book.title}
                      genre={book.genre}
                      status={book.status}
                      className="w-24 h-36 shrink-0"
                    />

                    {/* Book Metadata Header */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
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

                      <h3 className="text-lg font-serif font-bold text-slate-900 leading-snug line-clamp-2">
                        {book.title}
                      </h3>

                      <p className="text-xs text-slate-500 font-sans">
                        {book.genre || 'General Literature'} &bull; ISBN:{' '}
                        <span className="font-mono">{book.isbn || 'Pending Assignment'}</span>
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {book.publication_date ? `Published ${book.publication_date}` : 'Target: In Production'}
                        </span>
                        <span>
                          MRP: <strong className="text-slate-900">{formatCurrency(book.mrp)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Performance Stats Bar */}
                  <div className="mt-5 grid grid-cols-4 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Copies Sold</span>
                      <span className="font-serif font-bold text-slate-900 text-sm mt-0.5 block">
                        {book.total_copies_sold}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Royalty</span>
                      <span className="font-serif font-bold text-slate-900 text-sm mt-0.5 block">
                        {formatCurrency(book.total_royalty_earned)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Royalty Paid</span>
                      <span className="font-serif font-bold text-emerald-700 text-sm mt-0.5 block">
                        {formatCurrency(book.royalty_paid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pending</span>
                      <span className="font-serif font-bold text-amber-800 text-sm mt-0.5 block">
                        {formatCurrency(book.royalty_pending)}
                      </span>
                    </div>
                  </div>

                  {/* Distribution Platforms & Print Partner */}
                  <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="text-[11px] font-medium text-slate-400">Channels:</span>
                      {book.available_on && book.available_on.length > 0 ? (
                        book.available_on.map((ch) => (
                          <span
                            key={ch}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-sans"
                          >
                            {ch}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] italic text-slate-400">Distribution setup pending</span>
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
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="text-xs font-semibold text-leaf-800 hover:text-leaf-900 flex items-center gap-1 transition-colors"
                  >
                    <span>Full Royalty Breakdown</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => navigate(`/author/submit-query?book_id=${book.book_id}`)}
                    className="text-xs font-medium text-slate-600 hover:text-leaf-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-leaf-300 hover:bg-leaf-50/50 transition-all flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-leaf-700" />
                    <span>Raise Query for this Book</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Detail Modal / Drawer */}
      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedBook.book_id}
                </span>
                <h2 className="text-xl font-serif font-bold text-slate-900 mt-1">{selectedBook.title}</h2>
                <p className="text-xs text-slate-500">ISBN: {selectedBook.isbn || 'Pending Assignment'}</p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                BookLeaf 80/20 Royalty Audit
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">MRP</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(selectedBook.mrp)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Author Royalty Share Per Copy</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(selectedBook.author_royalty_per_copy)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Total Verified Copies Sold</span>
                  <span className="font-semibold text-slate-900">{selectedBook.total_copies_sold}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Total Royalty Earned (Net Profit Share)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(selectedBook.total_royalty_earned)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Disbursed to Bank Account</span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(selectedBook.royalty_paid)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 bg-amber-50/50 px-2 rounded">
                  <span className="font-semibold text-amber-900">Pending Disbursement</span>
                  <span className="font-bold text-amber-900">{formatCurrency(selectedBook.royalty_pending)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Last Payout Date</span>
                  <span className="text-slate-800 font-mono">
                    {selectedBook.last_royalty_payout_date || 'No disbursement cycle completed yet'}
                  </span>
                </div>
              </div>

              {selectedBook.royalty_pending > 0 && selectedBook.royalty_pending < 1000 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  ℹ️ This pending amount is below the ₹1,000 threshold and will disburse in the next quarterly cycle once accumulated.
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedBook(null);
                  navigate(`/author/submit-query?book_id=${selectedBook.book_id}`);
                }}
                className="px-4 py-2 bg-leaf-900 hover:bg-leaf-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Raise Ticket for this Book
              </button>
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
