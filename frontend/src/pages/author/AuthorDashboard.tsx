import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BookMarked,
  CheckCircle,
  Clock,
  Coins,
  FileQuestion,
  HelpCircle,
  Layers,
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
        <div className="h-28 bg-white rounded-xl border border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200" />
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
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-leaf-700">Author Account</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs font-mono text-slate-500">{stats?.author_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Welcome, {stats?.author_name}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-sans">
            Track your book distribution, quarterly royalty earnings, and real-time operations support directly with the BookLeaf team.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => navigate('/author/submit-query')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-leaf-900 hover:bg-leaf-800 text-white font-medium text-sm shadow-xs transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-amber-gold" />
            <span>Submit a Query</span>
          </button>
          <button
            onClick={() => navigate('/author/books')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
          >
            <BookMarked className="w-4 h-4 text-slate-500" />
            <span>My Books</span>
          </button>
        </div>
      </div>

      {/* Rollover Policy Alert Note if applicable */}
      {isRollover && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-start space-x-3 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Quarterly Royalty Threshold Notice: </span>
            Your pending royalty is {formatCurrency(stats?.royalty_pending)}, which is below BookLeaf's minimum disbursement threshold of ₹1,000. It has safely rolled over to the current quarter and will disburse once reached.
          </div>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Titles"
          value={stats?.total_books || 0}
          subtitle={`${stats?.published_books || 0} Live &bull; ${stats?.books_in_production || 0} In Production`}
          icon={<BookMarked className="w-5 h-5" />}
          accentColor="emerald"
          onClick={() => navigate('/author/books')}
        />
        <StatCard
          label="Total Copies Sold"
          value={stats?.total_copies_sold?.toLocaleString('en-IN') || 0}
          subtitle="Across Amazon, Flipkart & Store"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="slate"
        />
        <StatCard
          label="Total Royalty Earned"
          value={formatCurrency(stats?.total_royalty_earned)}
          subtitle="80% Net Author Profit Share"
          icon={<Coins className="w-5 h-5 text-amber-gold" />}
          accentColor="amber"
        />
        <StatCard
          label="Royalty Pending"
          value={formatCurrency(stats?.royalty_pending)}
          subtitle={`Paid to date: ${formatCurrency(stats?.royalty_paid)}`}
          icon={<Clock className="w-5 h-5 text-indigo-500" />}
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

      {/* Production & Support Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Tickets Overview (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">Recent Support Queries</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status updates on your questions</p>
            </div>
            <button
              onClick={() => navigate('/author/tickets')}
              className="text-xs font-semibold text-leaf-700 hover:text-leaf-900 transition-colors"
            >
              View All ({recentTickets?.length || 0}) &rarr;
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {ticketsLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading support tickets...</div>
            ) : !recentTickets || recentTickets.length === 0 ? (
              <div className="py-12 text-center">
                <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No support tickets raised yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Have a question about royalties, production, or distribution?
                </p>
                <button
                  onClick={() => navigate('/author/submit-query')}
                  className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-leaf-50 text-leaf-800 rounded-lg text-xs font-semibold hover:bg-leaf-100 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Raise a Query</span>
                </button>
              </div>
            ) : (
              recentTickets.slice(0, 4).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/author/tickets/${ticket.id}`)}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/70 -mx-3 px-3 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-500">{ticket.ticket_number}</span>
                      <Badge variant="category" value={ticket.category} size="sm">
                        {ticket.category}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-slate-900 truncate">{ticket.subject}</h4>
                    <p className="text-xs text-slate-500 truncate">
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-gold mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Publishing Standards</span>
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-lg">BookLeaf Author Policy</h3>
            <div className="mt-4 space-y-3 text-xs text-slate-600 font-sans">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-800 block mb-0.5">80/20 Net Profit Split</span>
                Calculated quarterly and disbursed directly within 45 days of the quarter ending.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-800 block mb-0.5">₹1,000 Minimum Payout</span>
                Earnings below ₹1,000 automatically roll over into the next quarter cycle.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-semibold text-slate-800 block mb-0.5">Delhi Print Facility & Turnaround</span>
                Standard order fulfillment turnaround is 5–7 business days with free reprint guarantee on verified defects.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Direct Author Helpline</span>
            <span className="font-mono text-slate-700">support@bookleafpub.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
