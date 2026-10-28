import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  FileQuestion,
  Filter,
  HelpCircle,
  MessageSquare,
  Search,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { useRealtime } from '../../hooks/useRealtime';

export const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Active SSE stream for real-time ticket state updates
  useRealtime();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', statusFilter],
    queryFn: () => api.getMyTickets(statusFilter),
  });

  const filteredTickets = tickets?.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.ticket_number.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.book_title && t.book_title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-leaf-800 font-semibold">
              Author Support
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500">
              {tickets ? `${tickets.length} Total Queries` : 'Loading...'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Support History & Active Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            Track real-time responses, investigations, and resolutions directly from the BookLeaf operations team.
          </p>
        </div>

        <button
          onClick={() => navigate('/author/submit-query')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-leaf-900 text-white font-medium text-xs sm:text-sm hover:bg-leaf-800 transition-colors shadow-xs self-start"
        >
          <HelpCircle className="w-4 h-4 text-amber-gold" />
          <span>Raise New Query</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket #, title, or keyword..."
            className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-leaf-600/20 focus:border-leaf-700 bg-stone-50/50 text-slate-900 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1.5">
            Status:
          </span>
          {['all', 'Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                statusFilter === s
                  ? 'bg-leaf-900 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200/80'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List View */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-stone-200/80" />
          ))}
        </div>
      ) : !filteredTickets || filteredTickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
          <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-slate-800">No support tickets found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search.trim()
              ? 'No tickets match your search criteria. Try a different query.'
              : 'You have not submitted any support inquiries yet.'}
          </p>
          <button
            onClick={() => navigate('/author/submit-query')}
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-leaf-900 text-white rounded-xl text-xs font-semibold hover:bg-leaf-800 transition-colors shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-gold" />
            <span>Raise a Query</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/author/tickets/${t.id}`)}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-card hover:border-leaf-300 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-xs font-mono font-semibold text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/60">
                    {t.ticket_number}
                  </span>
                  <Badge variant="category" value={t.category} size="sm">
                    {t.category}
                  </Badge>
                  <Badge variant="priority" value={t.priority} size="sm">
                    {t.priority}
                  </Badge>
                </div>

                <h3 className="text-base font-serif font-bold text-slate-900 group-hover:text-leaf-950 transition-colors line-clamp-1">
                  {t.subject}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 font-sans">
                  {t.description}
                </p>

                <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
                  <span>Related: <strong className="text-slate-600 font-medium">{t.book_title || 'General / Account'}</strong></span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Updated {new Date(t.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2">
                <Badge variant="status" value={t.status}>
                  {t.status}
                </Badge>
                <span className="text-xs font-medium text-leaf-800 group-hover:translate-x-0.5 transition-transform">
                  View Thread &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
