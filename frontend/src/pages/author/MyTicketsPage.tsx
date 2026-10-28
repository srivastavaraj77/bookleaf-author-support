import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
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
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">Support & Query History</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            Track communication, escalation progress, and resolutions with the BookLeaf operations desk.
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
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket # or subject..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Status:</span>
          {['all', 'Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-leaf-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : !filteredTickets || filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-slate-800">No support tickets match</h3>
            <p className="text-xs text-slate-500 mt-1">Submit a query whenever you need assistance from the team.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/author/tickets/${ticket.id}`)}
                className="p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {ticket.ticket_number}
                    </span>
                    <Badge variant="category" value={ticket.category} size="sm">
                      {ticket.category}
                    </Badge>
                    <Badge variant="priority" value={ticket.priority} size="sm">
                      {ticket.priority}
                    </Badge>
                  </div>

                  <h3 className="text-sm sm:text-base font-medium text-slate-900 leading-snug truncate">
                    {ticket.subject}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center space-x-2">
                    <span className="text-slate-700 font-medium">{ticket.book_title || 'General / Account Level'}</span>
                    <span>&bull;</span>
                    <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                  </p>

                  {/* Latest message snippet */}
                  {ticket.latest_message && (
                    <div className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-1">
                      <strong className="text-slate-800 capitalize">{ticket.latest_message.sender_role}:</strong>{' '}
                      {ticket.latest_message.message}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 space-y-1">
                  <Badge variant="status" value={ticket.status}>
                    {ticket.status}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(ticket.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

