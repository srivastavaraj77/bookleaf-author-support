import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-leaf-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-leaf-900 text-white flex items-center justify-center shadow-lg border border-leaf-700/50 mb-4">
          <BookOpen className="w-8 h-8 text-amber-gold" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">
          BOOKLEAF PUBLISHING
        </h1>
        <p className="mt-1 text-sm text-slate-600 font-serif italic">
          AI-Powered Author Support & Communication Portal
        </p>

        {searchParams.get('expired') && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            Your previous session expired. Please sign in again.
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start space-x-2 text-rose-800 text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@email.com or admin@bookleafpub.com"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 bg-white placeholder-slate-400 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 bg-white placeholder-slate-400 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-leaf-900 hover:bg-leaf-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-leaf-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Credentials Box for Evaluator */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center space-x-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Evaluation Demo Accounts (1-Click Fill)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@bookleafpub.com', 'AdminPassword123!')}
                className="p-2 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 transition-colors text-left"
              >
                <div className="text-xs font-semibold text-indigo-900">Admin Operations</div>
                <div className="text-[10px] text-indigo-700">admin@bookleafpub.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('priya.sharma@email.com', 'AuthorPassword123!')}
                className="p-2 rounded-lg border border-leaf-200 bg-leaf-50/60 hover:bg-leaf-100/70 transition-colors text-left"
              >
                <div className="text-xs font-semibold text-leaf-900">Priya Sharma (AUTH001)</div>
                <div className="text-[10px] text-leaf-700">2 books &bull; ₹3,570 pending</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('sneha.kulkarni@email.com', 'AuthorPassword123!')}
                className="p-2 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 transition-colors text-left"
              >
                <div className="text-xs font-semibold text-amber-900">Sneha Kulkarni (AUTH007)</div>
                <div className="text-[10px] text-amber-800">3 books &bull; In Production</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('kavita.deshmukh@email.com', 'AuthorPassword123!')}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="text-xs font-semibold text-slate-800">Kavita Deshmukh (AUTH009)</div>
                <div className="text-[10px] text-slate-600">₹850 rollover threshold</div>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          BookLeaf Publishing Platform &bull; ISO-Compliant Self Publishing Workflow
        </p>
      </div>
    </div>
  );
};
