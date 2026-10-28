import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../hooks/useRealtime';

export const AuthorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useRealtime((eventData) => {
    if (eventData.message) {
      setNotification(`New response received from ${eventData.sender_name || 'BookLeaf Support'}!`);
      setTimeout(() => setNotification(null), 6000);
    }
  });

  const navLinks = [
    { to: '/author/dashboard', label: 'Author Desk', icon: LayoutDashboard },
    { to: '/author/books', label: 'Book Catalog', icon: Library },
    { to: '/author/tickets', label: 'Support Inquiries', icon: MessageSquare },
    { to: '/author/submit-query', label: 'Raise Query', icon: HelpCircle },
  ];

  // Helper to determine current page title
  const getPageHeader = () => {
    if (location.pathname.includes('/books')) return { title: 'Author Book Catalog', category: 'Publishing' };
    if (location.pathname.includes('/tickets/')) return { title: 'Inquiry Conversation', category: 'Support' };
    if (location.pathname.includes('/tickets')) return { title: 'Support Workspace', category: 'Support' };
    if (location.pathname.includes('/submit-query')) return { title: 'Raise Support Query', category: 'Operations' };
    return { title: 'Editorial Dashboard', category: 'Overview' };
  };

  const headerInfo = getPageHeader();

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-slate-800 flex font-sans selection:bg-teal-100 selection:text-ink-950">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-ink-950 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-elevated border border-ink-800 flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <span className="w-2 h-2 rounded-full bg-brass-400 animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* COMPACT VERTICAL SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-ink-950 text-slate-300 border-r border-ink-900 shrink-0 select-none">
        {/* Brand Imprint Header */}
        <div className="p-6 border-b border-ink-900/80">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/author/dashboard')}
          >
            <div className="w-10 h-10 rounded-lg bg-teal-800/80 border border-teal-600/40 text-brass-300 flex items-center justify-center shadow-xs group-hover:bg-teal-700 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif font-bold text-base tracking-wide text-white block leading-tight">
                  BOOKLEAF
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-ink-900 text-brass-300 border border-ink-800">
                  AUTHOR
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium block mt-0.5">
                Publishing Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Vertical Navigation Stack */}
        <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-widest font-mono text-slate-500 font-semibold">
            Workspace
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
                      ? 'bg-ink-900 text-white font-semibold shadow-2xs border-l-2 border-teal-400'
                      : 'text-slate-400 hover:text-white hover:bg-ink-900/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-teal-400" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          {/* Quick Publishing Policy Stamp in Sidebar */}
          <div className="pt-6 px-3">
            <div className="p-3.5 rounded-xl bg-ink-900/60 border border-ink-900 text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-brass-300 font-semibold">
                <span>Royalty Split</span>
                <span>80% Net</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Quarterly bank transfers within 45 days. Minimum payout threshold ₹1,000.
              </p>
              <div className="flex items-center space-x-1.5 text-[10px] text-teal-300 font-mono pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span>Delhi Press Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Profile Area & Logout */}
        <div className="p-4 border-t border-ink-900/80 bg-ink-950/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-900 text-teal-200 border border-teal-700/60 flex items-center justify-center font-serif text-xs font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  {user?.author_id || user?.email}
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
                  <span className="font-serif font-bold text-base text-white">BOOKLEAF</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
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
                          isActive
                            ? 'bg-ink-900 text-white font-semibold border-l-2 border-teal-400'
                            : 'text-slate-400 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-teal-400" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-ink-900 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[10px] font-mono text-slate-400">{user?.author_id}</p>
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
            <button
              onClick={() => navigate('/author/submit-query')}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-medium transition-colors shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brass-300" />
              <span>Raise Query</span>
            </button>
          </div>
        </header>

        {/* Canvas Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-8 py-6 border-t border-stone-200/80 text-xs text-stone-400 font-sans flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <p>BookLeaf Publishing Platform &copy; {new Date().getFullYear()} &mdash; Editorial & Author Relations</p>
          <p className="text-[11px] font-mono text-stone-400">80/20 Net Profit &bull; Delhi Print House &bull; ISO-9001 Certified</p>
        </footer>
      </div>
    </div>
  );
};
