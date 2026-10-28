import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { TicketCategory, TicketPriority, TicketStatus } from '../../types';
import { useRealtime } from '../../hooks/useRealtime';

export const AdminTicketQueue: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const statusParam = searchParams.get('status') || 'all';
  const categoryParam = searchParams.get('category') || 'all';
  const priorityParam = searchParams.get('priority') || 'all';
  const sortByParam = searchParams.get('sort_by') || 'priority';

  const [search, setSearch] = useState('');

  // Real-time synchronization
  useRealtime();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['adminTickets', statusParam, categoryParam, priorityParam, sortByParam, search],
    queryFn: () =>
      api.getAdminTicketQueue({
        status: statusParam,
        category: categoryParam,
        priority: priorityParam,
        sort_by: sortByParam,
        search: search.trim() || undefined,
      }),
  });

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const categories: TicketCategory[] = [
    'Royalty & Payments',
    'ISBN & Metadata Issues',
    'Printing & Quality',
    'Distribution & Availability',
    'Book Status & Production Updates',
    'General Inquiry',
  ];

  const priorities: TicketPriority[] = ['Critical', 'High', 'Medium', 'Low'];
  const statuses: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

  return (
    <div className="space-y-6">
      {/* Queue Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Operational Triage
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500">
              {tickets ? `${tickets.length} Matching Queries` : 'Loading...'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Author Support Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            Central operational queue for all BookLeaf author requests across India and global distribution.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortByParam}
            onChange={(e) => setFilter('sort_by', e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-stone-200 bg-white text-slate-800 shadow-2xs focus:ring-2 focus:ring-leaf-600/20 focus:border-leaf-700"
          >
            <option value="priority">Priority First (Critical &rarr; Low)</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest Unresolved (SLA Focus)</option>
          </select>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by author, subject, ticket number, book..."
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-leaf-600/20 focus:border-leaf-700 bg-stone-50/50 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Reset Filters */}
          {(statusParam !== 'all' || categoryParam !== 'all' || priorityParam !== 'all' || search) && (
            <button
              onClick={() => {
                setSearchParams(new URLSearchParams());
                setSearch('');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-3 items-center text-xs">
          {/* Priority Filter */}
          <div className="flex items-center space-x-1 mr-2 flex-wrap gap-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Priority:</span>
            <button
              onClick={() => setFilter('priority', 'all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                priorityParam === 'all'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200/80'
              }`}
            >
              All
            </button>
            {priorities.map((p) => (
              <button
                key={p}
                onClick={() => setFilter('priority', p)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  priorityParam === p
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200/80'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 mr-2 flex-wrap gap-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            <button
              onClick={() => setFilter('status', 'all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusParam === 'all'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200/80'
              }`}
            >
              All
            </button>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter('status', s)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusParam === s
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200/80'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center space-x-1.5 ml-auto">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Category:</span>
            <select
              value={categoryParam}
              onChange={(e) => setFilter('category', e.target.value)}
              className="py-1 px-3 rounded-lg border border-stone-200 bg-white text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ticket Queue Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-stone-100 rounded-2xl" />
            ))}
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <div className="p-16 text-center">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-slate-800">No tickets match criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/90 border-b border-stone-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-mono">Ticket</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Subject & Context</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Age / Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {tickets.map((t) => {
                  const isCritical = t.priority === 'Critical';

                  return (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/admin/tickets/${t.id}`)}
                      className={`hover:bg-stone-50/90 cursor-pointer transition-all duration-150 ${
                        isCritical ? 'bg-rose-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        <span className="bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/60">
                          {t.ticket_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{t.author_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.author_id}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="font-medium text-slate-900 truncate">{t.subject}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {t.book_title || 'General / Account Level'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="category" value={t.category} size="sm">
                          {t.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="priority" value={t.priority} size="sm">
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="status" value={t.status} size="sm">
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-500 tabular-nums">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
