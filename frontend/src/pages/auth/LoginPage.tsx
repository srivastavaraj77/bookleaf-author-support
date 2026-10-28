import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Coins,
  Compass,
  Eye,
  EyeOff,
  Feather,
  FileText,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MessageSquareText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo account interaction states
  const [loadedAccountId, setLoadedAccountId] = useState<string | null>(null);
  const [showAllAuthors, setShowAllAuthors] = useState(false);

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
      setError(err?.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoAccount = (demoEmail: string, demoPass: string, accountId: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoadedAccountId(accountId);
    setTimeout(() => setLoadedAccountId(null), 3000);

    // Smoothly focus or scroll to form for user convenience
    const formElement = document.getElementById('signin-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Verified existing Author Demo Accounts from seed data
  const primaryAuthors = [
    {
      id: 'priya',
      authorId: 'AUTH001',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      badge: 'Published & Live',
      scenario: '2 published titles (Whispers of the Ganges, The Saffron Diaries) • ₹3,570 pending royalty from October cycle.',
      metric: '₹3,570 pending • 531 copies sold',
    },
    {
      id: 'rohit',
      authorId: 'AUTH002',
      name: 'Rohit Kapoor',
      email: 'rohit.kapoor@email.com',
      badge: 'Bestseller',
      scenario: 'High-volume titles (Startup Sutra, Code & Karma) • ₹13,024 pending royalties • Distributed across India, US, & UK.',
      metric: '₹13,024 pending • 2,079 copies sold',
    },
    {
      id: 'sneha',
      authorId: 'AUTH007',
      name: 'Sneha Kulkarni',
      email: 'sneha.kulkarni@email.com',
      badge: 'In Production',
      scenario: '3 titles including Midnight in Mysore in Cover Design phase • 2 live titles with ₹7,865 pending royalties.',
      metric: 'In Cover Design • ₹7,865 pending',
    },
    {
      id: 'kavita',
      authorId: 'AUTH009',
      name: 'Kavita Deshmukh',
      email: 'kavita.deshmukh@email.com',
      badge: 'Threshold Rollover',
      scenario: '₹850 pending royalty (below BookLeaf ₹1,000 disbursement threshold) • Raising Roots currently in Typesetting.',
      metric: '₹850 pending (Quarterly rollover)',
    },
  ];

  const secondaryAuthors = [
    {
      id: 'ananya',
      authorId: 'AUTH003',
      name: 'Ananya Reddy',
      email: 'ananya.reddy@email.com',
      badge: 'Published',
      scenario: 'Between Two Temples • ₹2,546 pending royalty awaiting first disbursement cycle.',
      metric: '₹2,546 pending',
    },
    {
      id: 'vikram',
      authorId: 'AUTH004',
      name: 'Vikram Joshi',
      email: 'vikram.joshi@email.com',
      badge: 'Quality Ticket',
      scenario: 'Debugging Life & The Last Monsoon • Has active print quality ticket for misaligned author copies.',
      metric: '₹3,350 pending • Active query',
    },
    {
      id: 'meera',
      authorId: 'AUTH005',
      name: 'Meera Nair',
      email: 'meera.nair@email.com',
      badge: 'Published',
      scenario: 'Cardamom & Chaos & Letters from Lakshadweep • ₹3,055 pending royalty.',
      metric: '₹3,055 pending',
    },
    {
      id: 'arjun',
      authorId: 'AUTH006',
      name: 'Arjun Malhotra',
      email: 'arjun.malhotra@email.com',
      badge: 'Published',
      scenario: 'Turban Tales • ₹2,464 pending royalty • Regional marketplace distribution.',
      metric: '₹2,464 pending',
    },
    {
      id: 'farhan',
      authorId: 'AUTH008',
      name: 'Farhan Sheikh',
      email: 'farhan.sheikh@email.com',
      badge: 'Disbursed',
      scenario: 'Ghazal of the Forgotten • 100% of earned royalties (₹3,120) fully disbursed to bank account.',
      metric: '₹0 pending • Fully settled',
    },
    {
      id: 'diya',
      authorId: 'AUTH010',
      name: 'Diya Chatterjee',
      email: 'diya.chatterjee@email.com',
      badge: 'Published',
      scenario: 'Durga’s Daughters & Howrah Nights • High-velocity Kolkata regional bestseller.',
      metric: '₹4,115 pending • 2 editions',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf7] py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-teal-100 selection:text-ink-950 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        {/* Brand Masthead Bar */}
        <header className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-stone-200/80 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-ink-950 text-brass-300 flex items-center justify-center shadow-card border border-ink-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-teal-800 font-semibold block">
                BookLeaf Publishing House
              </span>
              <span className="font-serif font-bold text-ink-950 text-lg leading-tight block">
                Author Relations & Operations Portal
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 text-xs text-stone-500 font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-700 animate-pulse" />
              <span>Platform v1.0 • Delhi Production Hub</span>
            </span>
          </div>
        </header>

        {/* HERO SECTION: Two-Column Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Impressive Editorial Value Proposition (col-span-7) */}
          <section className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-mono tracking-widest font-semibold uppercase">
                <Sparkles className="w-3.5 h-3.5 text-brass-500" />
                <span>YOUR STORIES. YOUR PUBLISHING JOURNEY.</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink-950 tracking-tight leading-[1.12]">
                Every book has a story. <br className="hidden sm:inline" />
                <span className="italic font-normal text-stone-700">We're here for yours.</span>
              </h1>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl font-sans">
                From tracking royalties to following production milestones and resolving publishing queries, manage your publishing journey through one connected workspace.
              </p>
            </div>

            {/* Three Concise Benefit Statements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-2 group hover:border-teal-400 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-serif font-bold text-ink-950">
                  Track your progress
                </h3>
                <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                  Stay informed about your books and production milestones from manuscript submission to print.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-2 group hover:border-brass-400 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-brass-50 text-brass-700 flex items-center justify-center border border-brass-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <Coins className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-serif font-bold text-ink-950">
                  Understand your earnings
                </h3>
                <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                  Get a clear view of royalty information, net splits, and quarterly payout thresholds.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-2 group hover:border-ink-400 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-ink-950 flex items-center justify-center border border-stone-200 shadow-2xs group-hover:scale-105 transition-transform">
                  <MessageSquareText className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-serif font-bold text-ink-950">
                  Get the right support
                </h3>
                <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                  Raise requests and follow real-time responses from the dedicated BookLeaf operations team.
                </p>
              </div>
            </div>

            {/* Tasteful Editorial Visual Element: Certified Publisher Colophon */}
            <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-brass-100/50 blur-2xl pointer-events-none" />

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-ink-950 text-brass-300 flex items-center justify-center shrink-0 border border-ink-800 shadow-card">
                  <BookOpenCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-teal-800 font-semibold">
                      BookLeaf Ex Libris Standard
                    </span>
                    <span className="text-stone-300">&bull;</span>
                    <span className="text-[10px] font-mono text-stone-400">ISO-9001 Facility</span>
                  </div>
                  <h4 className="font-serif font-bold text-ink-950 text-sm mt-0.5">
                    India's Leading Author-First Publishing Platform
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5 font-sans">
                    10 Seeded Author Profiles &bull; 18 Catalog Editions &bull; Guaranteed 80% Net Royalty
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <span className="text-[10px] font-mono text-stone-400">Global Reach:</span>
                <span className="text-xs font-mono font-semibold text-stone-800">
                  Amazon IN &bull; US &bull; UK &bull; Flipkart
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: The Improved Authentication Panel (col-span-5) */}
          <section className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-stone-200/90 space-y-6" id="signin-form">
              {/* Form Heading & Sign-In Instructions */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-teal-800 font-semibold block">
                  Author & Desk Access
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink-950 mt-1">
                  Sign in to your portal
                </h2>
                <p className="text-xs text-stone-500 mt-1 font-sans leading-relaxed">
                  Enter your registered BookLeaf credentials to securely access your publishing workspace.
                </p>
              </div>

              {/* Expired Session Notice */}
              {searchParams.get('expired') && (
                <div className="p-3 bg-brass-50 border border-brass-200 rounded-xl text-xs text-brass-900 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-brass-600 shrink-0" />
                  <span>Your previous session has expired. Please sign in again.</span>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start space-x-2.5 text-rose-800 text-xs animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-medium font-sans leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email-input"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 font-mono mb-1.5"
                  >
                    Registered Email Address
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. author@email.com or admin@bookleafpub.com"
                      autoComplete="username"
                      className="block w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 bg-white placeholder-stone-400 text-ink-950 transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Password Field with Show/Hide toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password-input"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 font-mono"
                    >
                      Security Password
                    </label>
                  </div>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="block w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 bg-white placeholder-stone-400 text-ink-950 transition-colors font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Prominent Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-ink-950 hover:bg-ink-900 border border-ink-800 focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all duration-150 shadow-2xs disabled:opacity-50 mt-3"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-brass-300 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </div>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-brass-400" />
                      <span>Sign In to Workspace</span>
                    </>
                  )}
                </button>
              </form>

              {/* Trust & Security Footnote */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-center space-x-3 text-[11px] text-stone-400 font-sans">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>256-Bit Encrypted Session</span>
                </span>
                <span>&bull;</span>
                <span>Role-Based Access Control</span>
              </div>
            </div>
          </section>
        </div>

        {/* DEMO ACCOUNTS SECTION: Separated into 2 Distinct Cards */}
        <section className="pt-4 border-t border-stone-200/80 space-y-6">
          {/* Section Introduction & Shared Password Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-teal-800 uppercase tracking-widest">
                <Users className="w-4 h-4 text-brass-500" />
                <span>Evaluation Environment</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-ink-950 mt-1">
                Explore the portal using a demo account.
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans max-w-2xl">
                Select an account profile below to test real-world scenarios. Choosing an account pre-fills your sign-in fields without automatically submitting credentials.
              </p>
            </div>

            {/* Display Shared Demo Password Clearly */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs shrink-0 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                Default Evaluation Passwords
              </span>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs font-mono">
                <div>
                  <span className="text-stone-500">Author accounts: </span>
                  <code className="bg-stone-100 px-1.5 py-0.5 rounded text-ink-950 font-bold border border-stone-200/80">
                    AuthorPassword123!
                  </code>
                </div>
                <div>
                  <span className="text-stone-500">Operations desk: </span>
                  <code className="bg-stone-100 px-1.5 py-0.5 rounded text-ink-950 font-bold border border-stone-200/80">
                    AdminPassword123!
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* TWO CLEARLY SEPARATED CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* CARD A — AUTHOR ACCOUNTS */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-card space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-100 shadow-2xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-ink-950 text-base">
                      Author Profiles (Authors & Writers)
                    </h3>
                    <p className="text-[11px] text-stone-500 font-sans">
                      Verified author personas across catalog, sales, and milestone stages
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200/80 font-semibold">
                  Author Role
                </span>
              </div>

              {/* Author Profile Rows */}
              <div className="space-y-3">
                {primaryAuthors.map((author) => {
                  const isLoaded = loadedAccountId === author.id;
                  return (
                    <div
                      key={author.id}
                      className="p-4 rounded-xl border border-stone-200/80 hover:border-teal-400 bg-stone-50/40 hover:bg-teal-50/20 transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-xs font-serif font-bold text-ink-950 group-hover:text-teal-950">
                              {author.name}
                            </span>
                            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded text-stone-600 border border-stone-200">
                              {author.authorId}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100 font-medium">
                              {author.badge}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                            {author.email}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleUseDemoAccount(author.email, 'AuthorPassword123!', author.id)
                          }
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all flex items-center gap-1.5 shadow-2xs ${
                            isLoaded
                              ? 'bg-teal-800 text-white'
                              : 'bg-white hover:bg-teal-700 hover:text-white text-teal-900 border border-teal-200/90'
                          }`}
                        >
                          {isLoaded ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-brass-300" />
                              <span>Filled in form!</span>
                            </>
                          ) : (
                            <>
                              <span>Use demo account</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-stone-600 font-sans leading-relaxed pt-1 border-t border-stone-200/50">
                        {author.scenario}
                      </p>

                      <div className="flex items-center space-x-2 text-[10px] font-mono text-stone-400">
                        <TrendingUp className="w-3 h-3 text-teal-700" />
                        <span>{author.metric}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Collapsible Section for Remaining 6 Authors */}
                {showAllAuthors && (
                  <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                    {secondaryAuthors.map((author) => {
                      const isLoaded = loadedAccountId === author.id;
                      return (
                        <div
                          key={author.id}
                          className="p-4 rounded-xl border border-stone-200/80 hover:border-teal-400 bg-stone-50/40 hover:bg-teal-50/20 transition-all space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="text-xs font-serif font-bold text-ink-950 group-hover:text-teal-950">
                                  {author.name}
                                </span>
                                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded text-stone-600 border border-stone-200">
                                  {author.authorId}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                                  {author.badge}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                                {author.email}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleUseDemoAccount(author.email, 'AuthorPassword123!', author.id)
                              }
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all flex items-center gap-1.5 shadow-2xs ${
                                isLoaded
                              ? 'bg-teal-800 text-white'
                              : 'bg-white hover:bg-teal-700 hover:text-white text-teal-900 border border-teal-200/90'
                              }`}
                            >
                              {isLoaded ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-brass-300" />
                                  <span>Filled in form!</span>
                                </>
                              ) : (
                                <>
                                  <span>Use demo account</span>
                                  <ArrowRight className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-stone-600 font-sans leading-relaxed pt-1 border-t border-stone-200/50">
                            {author.scenario}
                          </p>

                          <div className="flex items-center space-x-2 text-[10px] font-mono text-stone-400">
                            <TrendingUp className="w-3 h-3 text-teal-700" />
                            <span>{author.metric}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Toggle Button for More Authors */}
                <button
                  type="button"
                  onClick={() => setShowAllAuthors(!showAllAuthors)}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-300 hover:border-teal-400 text-stone-600 hover:text-teal-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors font-mono"
                >
                  {showAllAuthors ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Collapse additional author profiles</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>View 6 more pre-seeded author accounts</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CARD B — BOOKLEAF TEAM ACCOUNTS */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-card space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-ink-950 text-brass-300 flex items-center justify-center border border-ink-800 shadow-2xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-ink-950 text-base">
                      BookLeaf Team (Operations & Support)
                    </h3>
                    <p className="text-[11px] text-stone-500 font-sans">
                      Staff operations console with AI-assisted triage and policy copilot
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ink-950 text-brass-300 border border-ink-800 font-semibold">
                  Staff Role
                </span>
              </div>

              {/* Staff Account Row */}
              <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/40 hover:bg-stone-50 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-serif font-bold text-ink-950">
                        BookLeaf Support Operations Lead
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-medium">
                        Admin Privileges
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                      admin@bookleafpub.com
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleUseDemoAccount('admin@bookleafpub.com', 'AdminPassword123!', 'admin')
                    }
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all flex items-center gap-1.5 shadow-2xs ${
                      loadedAccountId === 'admin'
                        ? 'bg-ink-950 text-brass-300'
                        : 'bg-ink-950 hover:bg-ink-900 text-white border border-ink-800'
                    }`}
                  >
                    {loadedAccountId === 'admin' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-brass-400" />
                        <span>Filled in form!</span>
                      </>
                    ) : (
                      <>
                        <span>Use demo account</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-stone-600 font-sans leading-relaxed pt-2 border-t border-stone-200/50">
                  Supervises the central query triage queue, AI classification confidence scores, SLA turnaround monitoring, and author message dispatching.
                </p>

                {/* Team Capabilities Overview */}
                <div className="space-y-2 pt-2 border-t border-stone-200/50">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                    Key Demonstrable Workflows in This Portal:
                  </span>
                  <ul className="grid grid-cols-1 gap-1.5 text-xs text-stone-700 font-sans">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span><strong>Operations Triage Queue:</strong> Filter by SLA age, priority, and category.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span><strong>AI Policy Copilot:</strong> Inspect auto-generated response drafts based on BookLeaf policies.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span><strong>Private Internal Notes:</strong> Add confidential operations notes hidden from authors.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span><strong>Catalog & Royalty Reconciliation:</strong> Review author book sales & bank payout audit.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Security & Access Notice */}
              <div className="p-3.5 rounded-xl bg-brass-50/70 border border-brass-200/70 text-xs text-brass-900 flex items-start space-x-2.5">
                <Shield className="w-4 h-4 text-brass-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">Demonstration Safeguard</span>
                  <span className="text-[11px] text-brass-800 leading-relaxed block font-sans">
                    All demo profiles operate within a sandbox environment. Selecting a demo account fills the registered test email and password into the sign-in form above so you can review credentials and log in.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Page Footer */}
      <footer className="mt-12 pt-6 border-t border-stone-200/80 text-center text-xs text-stone-400 font-mono">
        BookLeaf Publishing Platform &bull; ISO-9001 Compliant Self-Publishing Facility &bull; All Demonstration Data Seeded for Evaluation
      </footer>
    </div>
  );
};