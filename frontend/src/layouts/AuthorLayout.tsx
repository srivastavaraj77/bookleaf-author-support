import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  Library,
  LogOut,
  MessageSquare,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../hooks/useRealtime';

export const AuthorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<string | null>(null);

  useRealtime((eventData) => {
    if (eventData.message) {
      setNotification(`New response received from ${eventData.sender_name || 'BookLeaf Support'}!`);
      setTimeout(() => setNotification(null), 6000);
    }
  });

  const navLinks = [
    { to: '/author/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/author/books', label: 'My Books', icon: Library },
    { to: '/author/tickets', label: 'Support History', icon: MessageSquare },
    { to: '/author/submit-query', label: 'Raise Query', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-800 flex flex-col font-sans selection:bg-leaf-200">
      {/* Live notification banner */}
      {notification && (
        <div className="bg-leaf-900 text-white text-xs font-medium px-4 py-2.5 text-center shadow-md flex items-center justify-center gap-2 border-b border-leaf-700 animate-in slide-in-from-top duration-300 z-50">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Publishing Portal Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate('/author/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-leaf-900 text-white flex items-center justify-center shadow-xs border border-leaf-700/60 group-hover:bg-leaf-800 transition-colors">
                <BookOpen className="w-5 h-5 text-amber-gold" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-lg tracking-tight text-slate-900 block leading-tight">
                    BOOKLEAF
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-800 border border-leaf-200/80">
                    Author
                  </span>
                </div>
                <span className="text-[10px] tracking-wider uppercase text-slate-500 font-medium block">
                  Publishing & Royalty Portal
                </span>
              </div>
            </div>

            {/* Desktop Navigation items */}
            <nav className="hidden md:flex items-center space-x-1 bg-stone-100/70 p-1 rounded-xl border border-stone-200/60">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs border border-stone-200/70'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 text-leaf-700" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right actions: SSE live indicator + User chip + Logout */}
            <div className="flex items-center space-x-3">
              {/* Real-time SSE indicator */}
              <div
                className="hidden lg:flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                title="Live Server-Sent Events stream connected"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">Live Sync</span>
              </div>

              {/* Author profile chip */}
              <div className="flex items-center space-x-2.5 pl-2 border-l border-stone-200">
                <div className="w-8 h-8 rounded-full bg-leaf-100 text-leaf-900 flex items-center justify-center font-serif font-bold text-xs border border-leaf-200">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                    {user?.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {user?.author_id || 'Author'}
                  </span>
                </div>
              </div>

              {/* Log out */}
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto border-t border-stone-100 px-3 py-2 space-x-1.5 bg-stone-50/50">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-leaf-900 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 border border-stone-200/60'
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

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200/80 py-8 text-xs text-slate-500 font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-md bg-leaf-900 text-white flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-amber-gold" />
            </div>
            <p className="font-serif font-semibold text-slate-800">
              BookLeaf Publishing Platform
            </p>
          </div>
          <p className="text-[11px] text-slate-400 text-center sm:text-right">
            ISO-9001 Certified Self-Publishing Workflow &bull; 80% Net Author Profit &bull; Delhi Print Facility
          </p>
        </div>
      </footer>
    </div>
  );
};
