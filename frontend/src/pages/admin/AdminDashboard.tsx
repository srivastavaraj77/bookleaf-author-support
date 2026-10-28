import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
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
        <div className="h-32 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Operations Banner */}
      <div className="bg-navy-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-navy-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-amber-gold">
              BookLeaf Publishing Operations
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-xs text-slate-400 font-mono">Live Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Author Support & Operations Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
            AI-assisted triage, knowledge base policy enforcement, and multi-channel author query management.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => navigate('/admin/tickets?priority=Critical')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Critical Queue ({stats?.critical_tickets || 0})</span>
          </button>
          <button
            onClick={() => navigate('/admin/tickets')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 transition-colors"
          >
            <Inbox className="w-4 h-4 text-leaf-400" />
            <span>Full Ticket Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Author Queries"
          value={stats?.total_tickets || 0}
          subtitle={`${stats?.open_tickets || 0} Open &bull; ${stats?.in_progress_tickets || 0} In Progress`}
          icon={<Inbox className="w-5 h-5 text-slate-500" />}
          accentColor="slate"
          onClick={() => navigate('/admin/tickets')}
        />
        <StatCard
          label="Critical & Urgent"
          value={(stats?.critical_tickets || 0) + (stats?.high_priority_tickets || 0)}
          subtitle={`${stats?.critical_tickets || 0} Critical &bull; ${stats?.high_priority_tickets || 0} High`}
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
          label="In Progress"
          value={stats?.in_progress_tickets || 0}
          subtitle="Currently with Operations team"
          icon={<Clock className="w-5 h-5 text-indigo-500" />}
          accentColor="indigo"
          onClick={() => navigate('/admin/tickets?status=In Progress')}
        />
        <StatCard
          label="Resolved / Closed"
          value={(stats?.resolved_tickets || 0) + (stats?.closed_tickets || 0)}
          subtitle={`${stats?.resolved_tickets || 0} Resolved &bull; ${stats?.closed_tickets || 0} Closed`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          accentColor="emerald"
          onClick={() => navigate('/admin/tickets?status=Resolved')}
        />
      </div>

      {/* Category Volume & Oldest Unresolved */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Volume Breakdown (1 column) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-slate-900 text-base">Query Volume by Category</h3>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-4 space-y-3">
              {stats?.category_volume?.map((item) => {
                const total = stats.total_tickets || 1;
                const percentage = Math.round((item.count / total) * 100);
                return (
                  <div
                    key={item.category}
                    onClick={() => navigate(`/admin/tickets?category=${encodeURIComponent(item.category)}`)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-800">{item.category}</span>
                      <span className="font-mono text-slate-500 font-semibold">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-leaf-700 rounded-full"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Categorized via BookLeaf AI Classifier
            </span>
          </div>
        </div>

        {/* Oldest Unresolved Tickets (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">Oldest Unresolved Queries</h3>
              <p className="text-xs text-slate-500 mt-0.5">High-priority queries needing SLA attention</p>
            </div>
            <button
              onClick={() => navigate('/admin/tickets?sort_by=oldest')}
              className="text-xs font-semibold text-leaf-700 hover:text-leaf-900 transition-colors"
            >
              View Queue by Age &rarr;
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {!stats?.oldest_unresolved || stats.oldest_unresolved.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No unresolved tickets currently in queue.
              </div>
            ) : (
              stats.oldest_unresolved.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/admin/tickets/${t.id}`)}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/70 -mx-2 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-semibold text-slate-700">{t.ticket_number}</span>
                      <Badge variant="priority" value={t.priority} size="sm">
                        {t.priority}
                      </Badge>
                      <Badge variant="status" value={t.status} size="sm">
                        {t.status}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-slate-900 truncate">{t.subject}</h4>
                    <p className="text-xs text-slate-500">
                      Author: <strong>{t.author_name}</strong> &bull; Age: <span className="text-rose-600 font-semibold">{t.age_hours} hours</span>
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

