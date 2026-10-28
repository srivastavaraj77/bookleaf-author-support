import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BookMarked,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  FileQuestion,
  HelpCircle,
  Library,
  MessageSquare,
  ShieldCheck,
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
        <div className="h-28 bg-white rounded-xl border border-stone-200/90" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-stone-200/90" />
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
  const thresholdProgress = Math.min(100, Math.round(((stats?.royalty_pending || 0) / 1000) * 100));

  return (
    <div className="space-y-8">
      {/* 1. DISTINCT EDITORIAL PAGE-HEADER & WELCOME AREA */}
      <div className="bg-white rounded-xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              Author Registry
            </span>
            <span className="text-stone-300">&bull;</span>
            <span className="text-xs font-mono text-stone-500">{stats?.author_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-950 tracking-tight">
            Author Workspace &bull; {stats?.author_name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-sans max-w-2xl">
            Live catalog performance, royalty disbursement audits, and direct support routing with the BookLeaf Delhi operations desk.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => navigate('/author/submit-query')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-ink-950 hover:bg-ink-900 text-white font-medium text-xs sm:text-sm shadow-2xs transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-brass-400" />
            <span>Submit Query</span>
          </button>
          <button
            onClick={() => navigate('/author/books')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs sm:text-sm transition-colors shadow-2xs"
          >
            <Library className="w-4 h-4 text-teal-700" />
            <span>Catalog Titles</span>
          </button>
        </div>
      </div>

      {/* 2. ROYALTY OVERVIEW WITH MEANINGFUL TIMELINE & THRESHOLD METER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-brass-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-950 font-sans">
              Financial & Royalty Disbursement Overview
            </h2>
          </div>
          <span className="text-[11px] font-mono text-teal-800 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
            80% Net Profit Policy
          </span>
        </div>

        {/* 2-Tier Financial & Timeline Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: 3 Financial Metrics (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Royalty Earned"
              value={formatCurrency(stats?.total_royalty_earned)}
              subtitle="80% Net Author Profit"
              icon={<Coins className="w-4 h-4" />}
              accentColor="brass"
            />
            <StatCard
              label="Disbursed to Bank"
              value={formatCurrency(stats?.royalty_paid)}
              subtitle="To verified bank account"
              icon={<CheckCircle2 className="w-4 h-4" />}
              accentColor="teal"
            />
            <StatCard
              label="Pending Settlement"
              value={formatCurrency(stats?.royalty_pending)}
              subtitle={isRollover ? 'Rolls over (< ₹1,000)' : 'Current cycle payout'}
              icon={<Clock className="w-4 h-4" />}
              accentColor="ink"
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

          {/* Right: Royalty Payout Timeline & Threshold Progress (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-100">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 font-sans">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" />
                  Quarterly Disbursement Schedule
                </span>
                <span className="font-mono text-[10px] text-stone-500">45-Day Cycle</span>
              </div>

              {/* Visual Timeline Chips */}
              <div className="mt-3 grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
                <div className="p-2 rounded bg-stone-50 border border-stone-200/60 text-stone-600">
                  <span className="block font-bold">Q1</span>
                  <span className="text-[9px] text-teal-700">Disbursed</span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-200/60 text-stone-600">
                  <span className="block font-bold">Q2</span>
                  <span className="text-[9px] text-teal-700">Disbursed</span>
                </div>
                <div className="p-2 rounded bg-teal-50 border border-teal-200 text-teal-900 font-semibold shadow-2xs">
                  <span className="block font-bold">Q3</span>
                  <span className="text-[9px] text-teal-800">Processing</span>
                </div>
                <div className="p-2 rounded bg-stone-50/50 border border-stone-200/40 text-stone-400">
                  <span className="block font-bold">Q4</span>
                  <span className="text-[9px]">Upcoming</span>
                </div>
              </div>
            </div>

            {/* Threshold Accumulation Bar */}
            <div className="pt-2 border-t border-stone-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500 font-sans">₹1,000 Disbursement Threshold:</span>
                <span className="font-mono font-semibold text-ink-950 tabular-nums">
                  {formatCurrency(stats?.royalty_pending)} / ₹1,000 ({thresholdProgress}%)
                </span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    thresholdProgress >= 100 ? 'bg-emerald-600' : 'bg-brass-500'
                  }`}
                  style={{ width: `${Math.max(thresholdProgress, 4)}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-400 font-sans">
                {thresholdProgress >= 100
                  ? '✓ Threshold reached. Scheduled for automatic bank transfer in the upcoming cycle.'
                  : `₹${1000 - (stats?.royalty_pending || 0)} more required to trigger automatic bank payout (accumulates without expiration).`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CATALOG SUMMARY & OPERATIONS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Support Inquiries (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-bold text-ink-950 text-base">
                Recent Operations & Support Tickets
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Real-time communications with BookLeaf editorial & production specialists
              </p>
            </div>
            <button
              onClick={() => navigate('/author/tickets')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-800 hover:text-teal-900 transition-colors"
            >
              <span>View All ({recentTickets?.length || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {ticketsLoading ? (
              <div className="py-8 text-center text-stone-400 text-xs">
                Loading support tickets...
              </div>
            ) : !recentTickets || recentTickets.length === 0 ? (
              <div className="py-10 text-center">
                <FileQuestion className="w-9 h-9 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-stone-700">No support tickets active</p>
                <p className="text-[11px] text-stone-400 mt-0.5 max-w-xs mx-auto">
                  Need assistance with royalties, ISBN barcodes, or print quality?
                </p>
                <button
                  onClick={() => navigate('/author/submit-query')}
                  className="mt-3.5 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-ink-950 text-white rounded-lg text-xs font-semibold hover:bg-ink-900 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-brass-400" />
                  <span>Raise Inquiry</span>
                </button>
              </div>
            ) : (
              recentTickets.slice(0, 4).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/author/tickets/${ticket.id}`)}
                  className="py-3 flex items-center justify-between hover:bg-stone-50/80 -mx-2 px-2 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200">
                        {ticket.ticket_number}
                      </span>
                      <Badge variant="category" value={ticket.category} size="sm">
                        {ticket.category}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-semibold text-ink-950 group-hover:text-teal-900 truncate transition-colors">
                      {ticket.subject}
                    </h4>
                    <p className="text-[11px] text-stone-400 truncate">
                      {ticket.book_title || 'General / Account Level'} &bull; Updated{' '}
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="status" value={ticket.status} size="sm">
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: BookLeaf Author Rights & Publishing Standards (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-brass-600 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500">
                Author Rights & Publishing Policy
              </span>
            </div>
            <h3 className="font-serif font-bold text-ink-950 text-base">
              BookLeaf Publishing Standards
            </h3>
            
            <div className="mt-4 space-y-2.5 text-xs text-stone-600 font-sans">
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70">
                <span className="font-semibold text-ink-950 block mb-0.5">
                  80/20 Net Author Profit Share
                </span>
                Net profit = Retail MRP minus printing costs, marketplace platform commission (Amazon/Flipkart), and shipping.
              </div>
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70">
                <span className="font-semibold text-ink-950 block mb-0.5">
                  Quarterly Automatic Bank Payout
                </span>
                Calculated quarterly and wired within 45 days. Balances below ₹1,000 rollover without expiration.
              </div>
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70">
                <span className="font-semibold text-ink-950 block mb-0.5">
                  Print Guarantee & Free Reprints
                </span>
                Verified physical defects on author copies (misprints, spine cuts, binding defects) are reprinted free of charge.
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
            <span>Direct Support Desk:</span>
            <span className="font-mono text-ink-950 font-medium">support@bookleafpub.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
