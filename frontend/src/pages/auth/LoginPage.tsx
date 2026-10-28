import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/author/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const demoAccounts = [
    {
      role: 'Admin Operations',
      email: 'admin@bookleafpub.com',
      pass: 'AdminPassword123!',
      badge: 'Support Desk',
      subtext: 'Full triage queue, AI draft review, overrides',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      bgHover: 'hover:bg-indigo-50/50',
      tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      role: 'Priya Sharma (AUTH001)',
      email: 'priya.sharma@email.com',
      pass: 'AuthorPassword123!',
      badge: 'Author Account',
      subtext: '2 published titles • ₹3,570 pending royalties',
      borderColor: 'border-leaf-200 hover:border-leaf-400',
      bgHover: 'hover:bg-leaf-50/50',
      tagColor: 'bg-leaf-50 text-leaf-800 border-leaf-200',
    },
    {
      role: 'Sneha Kulkarni (AUTH007)',
      email: 'sneha.kulkarni@email.com',
      pass: 'AuthorPassword123!',
      badge: 'Author Account',
      subtext: 'Midnight in Mysore • In Production (Cover Design)',
      borderColor: 'border-amber-200 hover:border-amber-400',
      bgHover: 'hover:bg-amber-50/50',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      role: 'Kavita Deshmukh (AUTH009)',
      email: 'kavita.deshmukh@email.com',
      pass: 'AuthorPassword123!',
      badge: 'Author Account',
      subtext: '₹850 pending • Quarterly Rollover threshold test',
      borderColor: 'border-stone-200 hover:border-stone-400',
      bgHover: 'hover:bg-stone-50/50',
      tagColor: 'bg-stone-50 text-stone-700 border-stone-200',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-leaf-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Emblem */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-leaf-900 text-white flex items-center justify-center shadow-card border border-leaf-700/60 mb-3.5">
          <BookOpen className="w-7 h-7 text-amber-gold" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">
          BOOKLEAF PUBLISHING
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-sans">
          AI-Powered Author Support & Communication Portal
        </p>

        {searchParams.get('expired') && (
          <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-center justify-center gap-1.5">
            <span>Your previous session expired. Please sign in again.</span>
          </div>
        )}
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card border border-stone-200/80 rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 flex items-start space-x-2 text-rose-800 text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@email.com or admin@bookleafpub.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-leaf-600/20 focus:border-leaf-700 bg-white placeholder-slate-400 text-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-leaf-600/20 focus:border-leaf-700 bg-white placeholder-slate-400 text-slate-900 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-leaf-900 hover:bg-leaf-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-leaf-700 disabled:opacity-50 transition-all duration-150 mt-2"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign In to Portal'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box for Evaluator */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-gold" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-sans">
                  Demo Accounts (1-Click Fill)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-left">
              {demoAccounts.map((item) => (
                <button
                  key={item.email}
                  type="button"
                  onClick={() => setDemoCredentials(item.email, item.pass)}
                  className={`p-2.5 rounded-xl border bg-white ${item.borderColor} ${item.bgHover} transition-all duration-150 text-left flex items-start justify-between group shadow-2xs`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-leaf-900">
                        {item.role}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${item.tagColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.subtext}</p>
                    <p className="text-[10px] font-mono text-slate-400">{item.email}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-leaf-800 opacity-0 group-hover:opacity-100 transition-opacity">
                    Fill &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Compliance Badges */}
        <div className="mt-6 flex items-center justify-center space-x-4 text-[11px] text-slate-400 font-sans">
          <div className="flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-leaf-700" />
            <span>256-Bit JWT Encryption</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-leaf-700" />
            <span>Author Data Isolation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
