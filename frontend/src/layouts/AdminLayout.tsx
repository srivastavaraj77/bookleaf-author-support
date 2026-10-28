import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  Inbox,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../hooks/useRealtime';

export const AdminLayout: React.FC = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [livePulse, setLivePulse] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  useRealtime(() => {
    setLivePulse(true);
    setTimeout(() => setLivePulse(false), 3000);
  });

  const navLinks = [
    { to: '/admin/dashboard', label: 'Operations Overview', icon: LayoutDashboard },
    { to: '/admin/tickets', label: 'Support Queue', icon: Inbox },
    { to: '/admin/tickets?priority=Critical', label: 'Critical Escalations', icon: AlertTriangle },
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col font-sans selection:bg-amber-200">
      {/* Top Operations Header */}
      <header className="bg-navy-950 text-white border-b border-navy-800/80 sticky top-0 z-40 shadow-card backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Admin Badge */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate('/admin/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-leaf-700 text-white flex items-center justify-center shadow-xs border border-leaf-600/50 group-hover:bg-leaf-600 transition-colors">
                <BookOpen className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-lg tracking-tight text-white block leading-tight">
                    BOOKLEAF
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                    OPS CONSOLE
                  </span>
                </div>
                <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium block">
                  Author Support & Triage Desk
                </span>
              </div>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex items-center space-x-1 bg-navy-900/80 p-1 rounded-xl border border-navy-800">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-white/10 text-white shadow-xs border border-white/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-gold" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* SSE Live Status indicator & Quick Switch */}
            <div className="flex items-center space-x-3">
              <div
                className={`hidden lg:flex items-center space-x-2 text-xs px-3 py-1 rounded-full border transition-colors ${
                  livePulse
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                    : 'bg-navy-900 text-slate-400 border-navy-800'
                }`}
                title="Real-Time Server-Sent Events stream connected"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    livePulse ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'
                  }`}
                />
                <span className="text-[11px] font-mono">SSE Stream Active</span>
              </div>

              {/* Quick Persona Switcher for Evaluators */}
              <div className="relative">
                <button
                  onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                  className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-navy-900 hover:bg-navy-800 border border-navy-800 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-amber-gold" />
                  <span>Switch Role</span>
                </button>

                {showSwitchMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-elevated border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      1-Click Role Switch
                    </div>
                    <button
                      onClick={() => handleQuickSwitch('admin@bookleafpub.com')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">Admin Operations</p>
                        <p className="text-[11px] text-slate-500">admin@bookleafpub.com</p>
                      </div>
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    </button>
                    <button
                      onClick={() => handleQuickSwitch('priya.sharma@email.com')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">Priya Sharma (Author)</p>
                        <p className="text-[11px] text-slate-500">2 books &bull; ₹3,570 pending</p>
                      </div>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => handleQuickSwitch('sneha.kulkarni@email.com')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
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

              {/* Log out */}
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors border border-transparent"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto border-t border-navy-800/60 px-3 py-2 space-x-1.5 bg-navy-950">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>BookLeaf Operations Desk &mdash; Powered by Hybrid AI Support Co-pilot</p>
          <p className="text-[11px] text-slate-400 font-mono">SLA Guarantee: Critical &lt; 2h &bull; Standard &lt; 24h</p>
        </div>
      </footer>
    </div>
  );
};
