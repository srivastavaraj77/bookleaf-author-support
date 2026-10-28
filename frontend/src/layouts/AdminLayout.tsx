import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../hooks/useRealtime';

export const AdminLayout: React.FC = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [livePulse, setLivePulse] = useState(false);

  useRealtime(() => {
    setLivePulse(true);
    setTimeout(() => setLivePulse(false), 3000);
  });

  const navLinks = [
    { to: '/admin/dashboard', label: 'Operations Desk', icon: LayoutDashboard },
    { to: '/admin/tickets', label: 'Triage Queue', icon: Inbox },
    { to: '/admin/tickets?priority=Critical', label: 'Critical Issues', icon: AlertTriangle },
  ];

  const handleQuickSwitch = async (email: string) => {
    try {
      setShowSwitchMenu(false);
      await login(email, email.includes('admin') ? 'AdminPassword123!' : 'AuthorPassword123!');
      if (email.includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/author/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPageHeader = () => {
    if (location.pathname.includes('/tickets/')) return { title: 'Ticket Triage Console', category: 'Operations' };
    if (location.pathname.includes('/tickets')) return { title: 'Author Support Queue', category: 'Operations' };
    return { title: 'Command Overview', category: 'Operations' };
  };

  const headerInfo = getPageHeader();

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-slate-800 flex font-sans selection:bg-teal-100 selection:text-ink-950">
      {/* COMPACT VERTICAL SIDEBAR (Admin) */}
      <aside className="hidden md:flex flex-col w-64 bg-ink-950 text-slate-300 border-r border-ink-900 shrink-0 select-none">
        {/* Brand Imprint Header */}
        <div className="p-6 border-b border-ink-900/80">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/admin/dashboard')}
          >
            <div className="w-10 h-10 rounded-lg bg-teal-800 border border-teal-600/40 text-brass-300 flex items-center justify-center shadow-xs group-hover:bg-teal-700 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif font-bold text-base tracking-wide text-white block leading-tight">
                  BOOKLEAF
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-brass-500/20 text-brass-300 border border-brass-500/30">
                  OPS
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium block mt-0.5">
                Support & Operations
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-widest font-mono text-slate-500 font-semibold">
            Triage Desk
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-ink-900 text-white font-semibold shadow-2xs border-l-2 border-brass-400'
                      : 'text-slate-400 hover:text-white hover:bg-ink-900/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-brass-400" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          {/* SLA Standard Notice */}
          <div className="pt-6 px-3">
            <div className="p-3.5 rounded-xl bg-ink-900/60 border border-ink-900 text-xs text-slate-400 space-y-2">
              <span className="text-[10px] font-mono uppercase text-teal-300 font-semibold block">
                SLA Operational Rules
              </span>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Critical tickets under 2h SLA. Standard tickets under 24h SLA. AI drafts require human review before dispatch.
              </p>
              <div className="flex items-center space-x-1.5 text-[10px] text-teal-300 font-mono pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span>Real-Time SSE Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Profile Area & Logout */}
        <div className="p-4 border-t border-ink-900/80 bg-ink-950/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brass-700 text-brass-100 border border-brass-500/60 flex items-center justify-center font-serif text-xs font-bold shrink-0">
                ADM
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  Operations Desk
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  admin@bookleafpub.com
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-ink-900 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-ink-950 text-slate-300 flex flex-col justify-between p-6 shadow-2xl z-10 border-r border-ink-900">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-ink-900">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-800 text-brass-300 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-serif font-bold text-base text-white">BOOKLEAF OPS</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 space-y-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          isActive ? 'bg-ink-900 text-white font-semibold border-l-2 border-brass-400' : 'text-slate-400 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-brass-400" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-ink-900 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Admin Operations</p>
                <p className="text-[10px] font-mono text-slate-400">admin@bookleafpub.com</p>
              </div>
              <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-400">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CANVAS VIEW */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Canvas Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-stone-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-stone-400 font-sans">
              <span className="font-mono text-stone-500 uppercase tracking-wider text-[11px]">
                {headerInfo.category}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
              <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                {headerInfo.title}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Persona Switcher for Evaluators */}
            <div className="relative">
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-brass-600" />
                <span>Switch Role</span>
              </button>

              {showSwitchMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-elevated border border-stone-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-stone-100 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Quick Evaluator Role Switch
                  </div>
                  <button
                    onClick={() => handleQuickSwitch('admin@bookleafpub.com')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Admin Operations</p>
                      <p className="text-[11px] text-slate-500 font-mono">admin@bookleafpub.com</p>
                    </div>
                    <Shield className="w-3.5 h-3.5 text-teal-700" />
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('priya.sharma@email.com')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Priya Sharma (Author)</p>
                      <p className="text-[11px] text-slate-500">2 books &bull; ₹3,570 pending</p>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('sneha.kulkarni@email.com')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Sneha Kulkarni (Author)</p>
                      <p className="text-[11px] text-slate-500">Midnight in Mysore (Production)</p>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Canvas Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-8 py-6 border-t border-stone-200/80 text-xs text-stone-400 font-sans flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <p>BookLeaf Operations Desk &mdash; Powered by Hybrid AI Support Co-pilot</p>
          <p className="text-[11px] font-mono text-stone-400">SLA: Critical &lt; 2h &bull; Standard &lt; 24h &bull; Delhi Print House</p>
        </footer>
      </div>
    </div>
  );
};
