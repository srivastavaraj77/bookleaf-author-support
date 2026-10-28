import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  KeyRound,
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
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const demoPasses = [
    {
      id: 'admin',
      role: 'Operations Desk',
      name: 'Admin Operations',
      email: 'admin@bookleafpub.com',
      pass: 'AdminPassword123!',
      badge: 'Staff',
      detail: 'Triage queue, SLA monitoring, AI response dispatcher',
    },
    {
      id: 'priya',
      role: 'Published Author',
      name: 'Priya Sharma (AUTH001)',
      email: 'priya.sharma@email.com',
      pass: 'AuthorPassword123!',
      badge: 'Live Catalog',
      detail: '2 published titles • ₹3,570 pending royalty',
    },
    {
      id: 'sneha',
      role: 'In-Production Author',
      name: 'Sneha Kulkarni (AUTH007)',
      email: 'sneha.kulkarni@email.com',
      pass: 'AuthorPassword123!',
      badge: 'Production',
      detail: 'Midnight in Mysore • In Cover Design phase',
    },
    {
      id: 'kavita',
      role: 'Threshold Author',
      name: 'Kavita Deshmukh (AUTH009)',
      email: 'kavita.deshmukh@email.com',
      pass: 'AuthorPassword123!',
      badge: 'Rollover',
      detail: '₹850 pending • Quarterly rollover threshold check',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-teal-100 selection:text-ink-950">
      {/* Centered Publisher Admission Folio */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Publisher Imprint Seal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ink-950 text-brass-300 shadow-card border border-ink-800 mb-3.5">
            <BookOpen className="w-7 h-7" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-teal-800 font-semibold">
            BookLeaf Publishing House
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-950 tracking-tight mt-1">
            Author Relations & Operations Desk
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Secure author access to distribution metrics, royalty statements, and operations inquiries.
          </p>

          {searchParams.get('expired') && (
            <div className="mt-3 p-2 bg-brass-50 border border-brass-200 rounded-lg text-xs text-brass-900">
              Session expired. Please sign in again.
            </div>
          )}
        </div>

        {/* Admission Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-stone-200/90 space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start space-x-2.5 text-rose-800 text-xs animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 font-sans mb-1.5">
                Registered Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@email.com or admin@bookleafpub.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 bg-white placeholder-stone-400 text-ink-950 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 font-sans mb-1.5">
                Security Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 bg-white placeholder-stone-400 text-ink-950 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-ink-950 hover:bg-ink-900 border border-ink-900 focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all duration-150 shadow-2xs disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 border-2 border-brass-300 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-brass-300" />
                  <span>Access Workspace</span>
                </>
              )}
            </button>
          </form>

          {/* Evaluator Passes Section */}
          <div className="pt-5 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                Evaluation Access (1-Click Fill)
              </span>
              <span className="text-[10px] text-teal-800 font-mono">Pre-seeded accounts</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {demoPasses.map((pass) => (
                <button
                  key={pass.id}
                  type="button"
                  onClick={() => setDemoCredentials(pass.email, pass.pass)}
                  className="p-3 rounded-xl border border-stone-200/90 hover:border-teal-400 hover:bg-teal-50/30 transition-all text-left flex items-center justify-between group shadow-2xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-ink-950 group-hover:text-teal-900">
                        {pass.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-stone-100 text-stone-600 border border-stone-200">
                        {pass.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">{pass.detail}</p>
                  </div>
                  <span className="text-[11px] font-mono text-teal-700 font-semibold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    Load &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Regulatory Footer */}
        <div className="mt-6 flex items-center justify-center space-x-4 text-[11px] text-stone-400 font-sans">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-700" />
            <span>256-Bit Encrypted Session</span>
          </div>
          <span>&bull;</span>
          <span>ISO-9001 Certified Publishing Facility</span>
        </div>
      </div>
    </div>
  );
};
