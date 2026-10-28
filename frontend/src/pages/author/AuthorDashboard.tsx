import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BookMarked,
  Clock,
  Coins,
  FileQuestion,
  HelpCircle,
  Library,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';

export const AuthorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['authorDashboard'],
    queryFn: () => api.getAuthorDashboard(),
  });

  const { data: recentTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['myRecentTickets'],
    queryFn: () => api.getMyTickets(),
  });

  if (statsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-white rounded-2xl border border-stone-200/80" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-stone-200/80" />
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const isRollover = (stats?.royalty_pending || 0) > 0 && (stats?.royalty_pending || 0) < 1000;

  return (
    <div className="space-y-8">
      {/* Editorial Welcome Banner */}
      <div className="relative bg-gradient-to-r from-leaf-950 via-leaf-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-leaf-800/60 shadow-card overflow-hidden">
        {/* Subtle decorative background blur & elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-leaf-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase tracking-widest font-mono text-amber-gold font-semibold">
                Author Account
              </span>
              <span className="text-white/30">&bull;</span>
              <span className="text-xs font-mono text-slate-300 px-2 py-0.5 rounded bg-white/10 border border-white/15">
                {stats?.author_id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Welcome back, {stats?.author_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              Real-time reporting on title distribution, verified bookstore sales, quarterly royalties, and direct author support.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate('/author/submit-query')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-gold hover:bg-amber-600 text-slate-950 font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-950" />
              <span>Raise Query</span>
            </button>
            <button
              onClick={() => navigate('/author/books')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm border border-white/20 transition-colors"
            >
              <Library className="w-4 h-4 text-amber-200" />
              <span>View Books</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rollover Policy Alert Note if applicable */}
      {isRollover && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5 text-amber-950 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold text-amber-900">
              Quarterly Payout Threshold Policy:
            </span>{' '}
            Your pending royalty is <strong>{formatCurrency(stats?.royalty_pending)}</strong>, which is under BookLeaf's ₹1,000 minimum bank disbursement threshold. It automatically rolls over and accumulates into the next quarter payout cycle once the threshold is crossed.
          </div>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Catalog Titles"
          value={stats?.total_books || 0}
          subtitle={`${stats?.published_books || 0} Live • ${stats?.books_in_production || 0} In Production`}
          icon={<BookMarked className="w-5 h-5" />}
          accentColor="emerald"
          onClick={() => navigate('/author/books')}
        />
        <StatCard
          label="Verified Copies Sold"
          value={stats?.total_copies_sold?.toLocaleString('en-IN') || 0}
          subtitle="Amazon, Flipkart & BookLeaf Store"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="slate"
        />
        <StatCard
          label="Total Royalty Earned"
          value={formatCurrency(stats?.total_royalty_earned)}
          subtitle="80% Net Profit Share"
          icon={<Coins className="w-5 h-5" />}
          accentColor="amber"
        />
        <StatCard
          label="Royalty Pending"
          value={formatCurrency(stats?.royalty_pending)}
          subtitle={`Paid to date: ${formatCurrency(stats?.royalty_paid)}`}
          icon={<Clock className="w-5 h-5" />}
          accentColor="indigo"
          badge={
            (stats?.royalty_pending || 0) > 0 ? (
              <Badge variant="status" value="open" size="sm">
                Pending
              </Badge>
            ) : (
              <Badge variant="status" value="resolved" size="sm">
                Settled
              </Badge>
            )
          }
        />
      </div>

      {/* Support Overview & Publishing Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Support Tickets Overview (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Recent Support Queries
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time conversation thread and status updates
              </p>
            </div>
            <button
              onClick={() => navigate('/author/tickets')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-leaf-700 hover:text-leaf-900 transition-colors"
            >
              <span>View All ({recentTickets?.length || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-stone-100">
            {ticketsLoading ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                Loading support tickets...
              </div>
            ) : !recentTickets || recentTickets.length === 0 ? (
              <div className="py-12 text-center">
                <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <p className="text-sm font-semibold text-slate-700">No support tickets raised yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Have a question about royalties, production, or marketplace distribution?
                </p>
                <button
                  onClick={() => navigate('/author/submit-query')}
                  className="mt-4 inline-flex items-center space-x-1.5 px-3.5 py-2 bg-leaf-900 text-white rounded-xl text-xs font-semibold hover:bg-leaf-800 transition-colors shadow-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-gold" />
                  <span>Raise a Query</span>
                </button>
              </div>
            ) : (
              recentTickets.slice(0, 4).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/author/tickets/${ticket.id}`)}
                  className="py-3.5 flex items-center justify-between hover:bg-stone-50/80 -mx-3 px-3 rounded-xl cursor-pointer transition-all duration-150 group"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-400">
                        {ticket.ticket_number}
                      </span>
                      <Badge variant="category" value={ticket.category} size="sm">
                        {ticket.category}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-slate-900 group-hover:text-leaf-900 truncate transition-colors">
                      {ticket.subject}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {ticket.book_title || 'General / Account Level'} &bull; Updated{' '}
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="status" value={ticket.status}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BookLeaf Author Information Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-gold mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                Author Rights & Standards
              </span>
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-lg">
              BookLeaf Author Policy
            </h3>
            <div className="mt-4 space-y-3 text-xs text-slate-600 font-sans">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                <span className="font-semibold text-slate-900 block mb-1">
                  80/20 Net Profit Split
                </span>
                Calculated quarterly: (MRP - Print Cost - Platform Fee - Shipping). Disbursed within 45 days of quarter end.
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                <span className="font-semibold text-slate-900 block mb-1">
                  ₹1,000 Minimum Payout
                </span>
                Balances under ₹1,000 automatically roll over and disburse once reached.
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                <span className="font-semibold text-slate-900 block mb-1">
                  Free Print Reprints
                </span>
                100% free reprinted copies on verified binding or alignment defects reported within 7 days.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500">
            <span>Operations Desk:</span>
            <span className="font-mono text-slate-800 font-medium">support@bookleafpub.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
