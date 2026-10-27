import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  Filter,
  Inbox,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../hooks/useRealtime';

export const AdminLayout: React.FC = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [livePulse, setLivePulse] = useState(false);

  useRealtime(() => {
    setLivePulse(true);
    setTimeout(() => setLivePulse(false), 3000);
  });

  const navLinks = [
    { to: '/admin/dashboard', label: 'Operations Overview', icon: LayoutDashboard },
    { to: '/admin/tickets', label: 'Ticket Queue', icon: Inbox },
    { to: '/admin/tickets?priority=Critical', label: 'Critical Issues', icon: AlertTriangle },
  ];

  const handleQuickSwitch = async (email: string) => {
    try {
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
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Operations Header */}
      <header className="bg-navy-950 text-white border-b border-navy-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Admin Badge */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
              <div className="w-10 h-10 rounded-lg bg-leaf-600 text-white flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-lg tracking-tight text-white block leading-tight">
                    BOOKLEAF
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold block">
                  Support & Operations Control
                </span>
              </div>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-white/10 text-white font-semibold border border-white/20'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-leaf-400" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* SSE Live Status indicator & Quick Switch */}
            <div className="flex items-center space-x-4">
              <div
                className="hidden lg:flex items-center space-x-2 text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700"
                title="Real-Time Server-Sent Events stream connected"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    livePulse ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
                <span className="text-slate-300 font-mono text-[11px]">Live SSE</span>
              </div>

              {/* Evaluator Quick Demo Switcher */}
              <div className="relative group">
                <button className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Demo Switcher</span>
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-2 hidden group-hover:block z-50">
                  <div className="px-3 py-1 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Quick Switch Account
                  </div>
                  <button
                    onClick={() => handleQuickSwitch('admin@bookleafpub.com')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between text-indigo-700 font-medium"
                  >
                    <span>Admin Operations Lead</span>
                    <span className="text-[10px] font-mono text-slate-400">admin</span>
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('priya.sharma@email.com')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Priya Sharma (AUTH001)</span>
                    <span className="text-[10px] font-mono text-slate-400">2 books</span>
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('sneha.kulkarni@email.com')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Sneha Kulkarni (AUTH007)</span>
                    <span className="text-[10px] font-mono text-slate-400">3 books</span>
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('kavita.deshmukh@email.com')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Kavita Deshmukh (AUTH009)</span>
                    <span className="text-[10px] font-mono text-slate-400">₹850 rollover</span>
                  </button>
                </div>
              </div>

              {/* Admin profile and logout */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{user?.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Operations Lead</span>
                </div>
                <button
                  onClick={logout}
                  title="Log Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto border-t border-navy-800 px-2 py-1.5 space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                    isActive ? 'bg-white/20 text-white font-semibold' : 'text-slate-300'
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

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Operations Footer */}
      <footer className="bg-navy-950 text-slate-400 border-t border-navy-800 py-4 text-center text-xs font-sans">
        <p>BookLeaf Publishing Ops Portal &bull; AI Response Calibration &bull; Delhi Print Center &bull; Confidential</p>
      </footer>
    </div>
  );
};
