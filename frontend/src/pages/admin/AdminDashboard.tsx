import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Filter,
  Inbox,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { useRealtime } from '../../hooks/useRealtime';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Real-time synchronization
  useRealtime();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.getAdminDashboard(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-white rounded-xl border border-stone-200/90" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-stone-200/90" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Operations Command Header */}
      <div className="relative bg-ink-950 text-white rounded-xl p-6 sm:p-8 shadow-card border border-ink-800 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brass-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase tracking-widest font-mono text-brass-400 font-semibold">
                Central Operations Console
              </span>
              <span className="text-white/30">&bull;</span>
              <span className="text-xs font-mono text-stone-300">
                Delhi Print Facility & Global Distribution
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Author Support & Operations Desk
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl font-sans leading-relaxed">
              AI-assisted query triage, policy compliance auditing, and multi-channel author communications management.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate('/admin/tickets?priority=Critical')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-2xs transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Escalations ({stats?.critical_tickets || 0})</span>
            </button>
            <button
              onClick={() => navigate('/admin/tickets')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-100 font-medium text-xs sm:text-sm border border-white/20 transition-colors"
            >
              <Inbox className="w-4 h-4 text-brass-300" />
              <span>Full Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Queries Received"
          value={stats?.total_tickets || 0}
          subtitle={`${stats?.open_tickets || 0} Open • ${stats?.in_progress_tickets || 0} In Progress`}
          icon={<Inbox className="w-5 h-5 text-teal-700" />}
          accentColor="slate"
          onClick={() => navigate('/admin/tickets')}
        />
        <StatCard
          label="Critical & Urgent"
          value={(stats?.critical_tickets || 0) + (stats?.high_priority_tickets || 0)}
          subtitle={`${stats?.critical_tickets || 0} Critical • ${stats?.high_priority_tickets || 0} High`}
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          accentColor="rose"
          badge={
            (stats?.critical_tickets || 0) > 0 ? (
              <Badge variant="priority" value="critical" size="sm">
                Requires Action
              </Badge>
            ) : undefined
          }
          onClick={() => navigate('/admin/tickets?priority=Critical')}
        />
        <StatCard
          label="In Active Review"
          value={stats?.in_progress_tickets || 0}
          subtitle="Assigned to support specialists"
          icon={<Clock className="w-5 h-5 text-teal-600" />}
          accentColor="indigo"
          onClick={() => navigate('/admin/tickets?status=In Progress')}
        />
        <StatCard
          label="Resolved & Closed"
          value={(stats?.resolved_tickets || 0) + (stats?.closed_tickets || 0)}
          subtitle={`${stats?.resolved_tickets || 0} Resolved • ${stats?.closed_tickets || 0} Closed`}
          icon={<CheckCircle className="w-5 h-5 text-teal-700" />}
          accentColor="emerald"
          onClick={() => navigate('/admin/tickets?status=Resolved')}
        />
      </div>

      {/* Category Volume & Oldest Unresolved */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Volume Breakdown (1 column) */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <h3 className="font-serif font-bold text-ink-950 text-base">
                Query Distribution by Category
              </h3>
              <BarChart3 className="w-4 h-4 text-stone-400" />
            </div>

            <div className="mt-4 space-y-2.5">
              {stats?.category_volume?.map((item) => {
                const total = stats.total_tickets || 1;
                const percentage = Math.round((item.count / total) * 100);
                return (
                  <div
                    key={item.category}
                    onClick={() => navigate(`/admin/tickets?category=${encodeURIComponent(item.category)}`)}
                    className="p-3 rounded-lg hover:bg-stone-50/80 transition-all cursor-pointer border border-transparent hover:border-stone-200 group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-stone-800 group-hover:text-ink-950 transition-colors">
                        {item.category}
                      </span>
                      <span className="font-mono text-stone-500 font-semibold tabular-nums">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-700 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(percentage, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <span className="text-[11px] text-stone-400 font-mono">
              Auto-Classified via BookLeaf Policy Classifier
            </span>
          </div>
        </div>

        {/* Oldest Unresolved Tickets (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-bold text-ink-950 text-base">
                Oldest Unresolved Inquiries
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 font-sans">
                Prioritized queue requiring operations SLA turnaround
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/tickets?sort_by=oldest')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-800 hover:text-teal-950 transition-colors font-mono"
            >
              <span>View by Age</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-stone-100">
            {!stats?.oldest_unresolved || stats.oldest_unresolved.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs font-sans">
                No unresolved tickets currently pending in queue.
              </div>
            ) : (
              stats.oldest_unresolved.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/admin/tickets/${t.id}`)}
                  className="py-3.5 flex items-center justify-between hover:bg-stone-50/80 -mx-3 px-3 rounded-lg cursor-pointer transition-all duration-150 group"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/60">
                        {t.ticket_number}
                      </span>
                      <Badge variant="priority" value={t.priority} size="sm">
                        {t.priority}
                      </Badge>
                      <Badge variant="status" value={t.status} size="sm">
                        {t.status}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-stone-900 group-hover:text-ink-950 truncate transition-colors">
                      {t.subject}
                    </h4>
                    <p className="text-xs text-stone-500 font-sans">
                      Author: <strong className="text-stone-800">{t.author_name}</strong> &bull; Queue Age:{' '}
                      <span className="text-rose-700 font-semibold font-mono">{t.age_hours}h</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-stone-50 group-hover:bg-teal-50 flex items-center justify-center shrink-0 text-stone-400 group-hover:text-teal-900 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};