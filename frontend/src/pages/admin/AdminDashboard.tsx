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
        <div className="h-36 bg-white rounded-3xl border border-stone-200/80" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-stone-200/80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Operations Command Header */}
      <div className="relative bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-card border border-navy-800 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 rounded-full bg-leaf-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase tracking-widest font-mono text-amber-gold font-semibold">
                Central Operations Console
              </span>
              <span className="text-white/30">&bull;</span>
              <span className="text-xs font-mono text-slate-300">
                Delhi Print Facility & Global Distribution
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Author Support & Operations Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              AI-assisted query triage, policy compliance auditing, and multi-channel author communications management.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate('/admin/tickets?priority=Critical')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Escalations ({stats?.critical_tickets || 0})</span>
            </button>
            <button
              onClick={() => navigate('/admin/tickets')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 font-medium text-xs sm:text-sm border border-white/20 transition-colors"
            >
              <Inbox className="w-4 h-4 text-amber-200" />
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
          icon={<Inbox className="w-5 h-5" />}
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
          icon={<Clock className="w-5 h-5 text-indigo-500" />}
          accentColor="indigo"
          onClick={() => navigate('/admin/tickets?status=In Progress')}
        />
        <StatCard
          label="Resolved & Closed"
          value={(stats?.resolved_tickets || 0) + (stats?.closed_tickets || 0)}
          subtitle={`${stats?.resolved_tickets || 0} Resolved • ${stats?.closed_tickets || 0} Closed`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          accentColor="emerald"
          onClick={() => navigate('/admin/tickets?status=Resolved')}
        />
      </div>

      {/* Category Volume & Oldest Unresolved */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Category Volume Breakdown (1 column) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <h3 className="font-serif font-bold text-slate-900 text-base">
                Query Distribution by Category
              </h3>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-4 space-y-2.5">
              {stats?.category_volume?.map((item) => {
                const total = stats.total_tickets || 1;
                const percentage = Math.round((item.count / total) * 100);
                return (
                  <div
                    key={item.category}
                    onClick={() => navigate(`/admin/tickets?category=${encodeURIComponent(item.category)}`)}
                    className="p-3 rounded-2xl hover:bg-stone-50/80 transition-all cursor-pointer border border-transparent hover:border-stone-200 group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-800 group-hover:text-leaf-950 transition-colors">
                        {item.category}
                      </span>
                      <span className="font-mono text-slate-500 font-semibold tabular-nums">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-leaf-800 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(percentage, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-Classified via BookLeaf Policy Classifier
            </span>
          </div>
        </div>

        {/* Oldest Unresolved Tickets (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">
                Oldest Unresolved Inquiries
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prioritized queue requiring operations SLA turnaround
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/tickets?sort_by=oldest')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-leaf-800 hover:text-leaf-950 transition-colors"
            >
              <span>View by Age</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-stone-100">
            {!stats?.oldest_unresolved || stats.oldest_unresolved.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No unresolved tickets currently pending in queue.
              </div>
            ) : (
              stats.oldest_unresolved.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/admin/tickets/${t.id}`)}
                  className="py-3.5 flex items-center justify-between hover:bg-stone-50/80 -mx-3 px-3 rounded-2xl cursor-pointer transition-all duration-150 group"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-semibold text-slate-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/60">
                        {t.ticket_number}
                      </span>
                      <Badge variant="priority" value={t.priority} size="sm">
                        {t.priority}
                      </Badge>
                      <Badge variant="status" value={t.status} size="sm">
                        {t.status}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-slate-900 group-hover:text-leaf-950 truncate transition-colors">
                      {t.subject}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Author: <strong className="text-slate-800">{t.author_name}</strong> &bull; Queue Age:{' '}
                      <span className="text-rose-700 font-semibold font-mono">{t.age_hours}h</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-stone-50 group-hover:bg-leaf-50 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-leaf-900 transition-colors">
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
