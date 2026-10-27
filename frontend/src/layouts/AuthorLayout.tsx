import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, HelpCircle, LayoutDashboard, Library, LogOut, MessageSquare, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../hooks/useRealtime';

export const AuthorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<string | null>(null);

  useRealtime((eventData) => {
    if (eventData.message) {
      setNotification(`New response received from ${eventData.sender_name || 'BookLeaf Support'}!`);
      setTimeout(() => setNotification(null), 5000);
    }
  });

  const navLinks = [
    { to: '/author/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/author/books', label: 'My Books', icon: Library },
    { to: '/author/tickets', label: 'My Tickets', icon: MessageSquare },
    { to: '/author/submit-query', label: 'Raise a Query', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 flex flex-col font-sans">
      {/* Live notification banner */}
      {notification && (
        <div className="bg-emerald-600 text-white text-xs font-medium px-4 py-2 text-center animate-in slide-in-from-top duration-300 shadow-sm flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
          {notification}
        </div>
      )}

      {/* Main Publishing Portal Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/author/dashboard')}>
              <div className="w-10 h-10 rounded-lg bg-leaf-900 text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-5 h-5 text-amber-gold" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg tracking-tight text-slate-900 block leading-tight">
                  BOOKLEAF
                </span>
                <span className="text-[10px] tracking-widest uppercase text-leaf-700 font-semibold block">
                  Author Portal
                </span>
              </div>
            </div>

            {/* Navigation items */}
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
                          ? 'bg-leaf-50 text-leaf-900 font-semibold shadow-xs border border-leaf-200/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-leaf-700" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* User profile and actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">{user?.name}</span>
                <span className="text-[11px] text-slate-500 font-mono">{user?.author_id || user?.email}</span>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto border-t border-slate-100 px-2 py-1.5 space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                    isActive ? 'bg-leaf-100 text-leaf-900 font-semibold' : 'text-slate-600'
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
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-sans">
        <p>BookLeaf Publishing &copy; {new Date().getFullYear()} &mdash; Author Communication & Support System</p>
        <p className="mt-1 text-[11px] text-slate-400">Operating in India & US &bull; Delhi Print Facility &bull; 80/20 Royalty Split</p>
      </footer>
    </div>
  );
};
