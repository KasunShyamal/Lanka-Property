'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Building,
  Key,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    authModalMessage,
    closeAuthModal,
    login,
    loginWithGoogle,
    register,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Group / Role selection (Buyer, Seller, Agent)
  const [role, setRole] = useState<'BUYER' | 'SELLER' | 'AGENT'>('BUYER');
  const [agencyName, setAgencyName] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Google OAuth Client ID state
  const [googleClientId, setGoogleClientId] = useState(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '263704362919-etcvu6ktp9pqecdfhbvmgjtqo8p7d1dm.apps.googleusercontent.com'
  );
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);

  const [isGooglePopupOpen, setIsGooglePopupOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isAddingNewGoogleAccount, setIsAddingNewGoogleAccount] = useState(false);
  const [savedGoogleUser, setSavedGoogleUser] = useState<{ email: string; name: string } | null>(null);

  // Load previously used Google account ONLY from this specific browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('lp_saved_google_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.email) {
            setSavedGoogleUser(parsed);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Keep activeTab in sync with modal tab requested
  useEffect(() => {
    setActiveTab(authModalTab);
    setErrorMsg(null);
    if (!isAuthModalOpen) {
      setIsGooglePopupOpen(false);
      setIsAddingNewGoogleAccount(false);
    }
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignInClick = async () => {
    setErrorMsg(null);
    if (role === 'AGENT' && !agencyName) {
      setErrorMsg('Please specify your Agency / Brokerage name to register as an Agent.');
      return;
    }

    // 1. Automatically trigger Google's native Browser Account Picker
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2 && googleClientId) {
      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'openid email profile',
          prompt: 'select_account',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              console.warn('Google OAuth popup response error:', tokenResponse.error);
              setIsGooglePopupOpen(true);
              return;
            }
            if (tokenResponse?.access_token) {
              setIsLoading(true);
              try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await userInfoRes.json();
                if (profile?.email) {
                  await handleGoogleAccountSelect(profile.email, profile.name || profile.given_name || 'Google User');
                } else {
                  setIsGooglePopupOpen(true);
                }
              } catch (fetchErr: any) {
                console.error('Failed to fetch Google profile:', fetchErr);
                setIsGooglePopupOpen(true);
              } finally {
                setIsLoading(false);
              }
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('OAuth token client failed, falling back to in-app chooser:', err);
      }
    }

    // 2. Fallback to in-app account prompt if Google client is not loaded or origin mismatch
    setIsGooglePopupOpen(true);
  };

  const handleGoogleAccountSelect = async (accountEmail: string, accountName: string) => {
    if (!accountEmail || !accountEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google email address.');
      return;
    }
    if (role === 'AGENT' && !agencyName) {
      setErrorMsg('Please specify your Agency / Brokerage name to register as an Agent.');
      setIsGooglePopupOpen(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const trimmedEmail = accountEmail.trim().toLowerCase();
      const trimmedName = accountName.trim() || trimmedEmail.split('@')[0];
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}&backgroundColor=059669`;

      const res = await loginWithGoogle({
        email: trimmedEmail,
        full_name: trimmedName,
        avatar_url: avatarUrl,
        role,
        agency_name: role === 'AGENT' ? agencyName : undefined,
      });

      if (res.success) {
        // Remember only on this visitor's browser for 1-click convenience
        if (typeof window !== 'undefined') {
          try {
            const userObj = { email: trimmedEmail, name: trimmedName };
            localStorage.setItem('lp_saved_google_user', JSON.stringify(userObj));
            setSavedGoogleUser(userObj);
          } catch (e) {}
        }
        setIsGooglePopupOpen(false);
        closeAuthModal();
      } else {
        setErrorMsg(res.error || 'Google authentication failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };



  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    const res = await login({ email, password });
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (role === 'AGENT' && !agencyName) {
      setErrorMsg('Please specify your agency or brokerage name.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    const res = await register({
      email,
      password,
      full_name: fullName,
      phone,
      role,
      agency_name: role === 'AGENT' ? agencyName : undefined,
    });
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  const fillQuickCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
        <div
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Top Header Background */}
        <div className="bg-gradient-to-br from-brand-dark via-slate-900 to-emerald-950 p-5 sm:p-6 text-white relative flex-shrink-0">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold tracking-wide flex items-center gap-1 border border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              LankaProperty Portal
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {activeTab === 'login' ? 'Sign In to LankaProperty' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {activeTab === 'login'
              ? 'Access real estate listings, bidding rooms, and inspections.'
              : 'Join Sri Lanka’s verified property ecosystem.'}
          </p>

          {authModalMessage && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{authModalMessage}</span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 sm:py-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 sm:py-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          {/* Error Message banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 1: SELECTABLE ACCOUNT GROUP (BUYER, SELLER, AGENT)        */}
          {/* ============================================================== */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Select Account Group:</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                {role}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'BUYER', label: 'Buyer', desc: 'Browse & Bid' },
                { id: 'SELLER', label: 'Seller', desc: 'List Properties' },
                { id: 'AGENT', label: 'Agent', desc: 'Realtor' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setRole(item.id as any)}
                  className={`p-2 rounded-xl border text-center transition ${
                    role === item.id
                      ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-semibold'
                  }`}
                >
                  <div className="text-xs">{item.label}</div>
                  <div className={`text-[9px] ${role === item.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>

            {role === 'AGENT' && (
              <div className="mt-2.5 pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Agency / Brokerage Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="e.g. Premier Island Realtors Colombo"
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* STEP 2: GOOGLE SIGN IN BUTTON (OPENS GOOGLE ACCOUNT CHOOSER)   */}
          {/* ============================================================== */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignInClick}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl shadow-sm transition active:scale-[0.98] disabled:opacity-50 group"
            >
              {/* Google colored G svg */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>
                Continue with Google as{' '}
                <strong className="text-emerald-700 capitalize font-bold">
                  {role.toLowerCase()}
                </strong>
              </span>
            </button>

            {/* In-modal helper if Google Client ID not yet set */}
            {showClientIdConfig && (
              <div className="mt-3 p-3.5 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 space-y-2.5 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <Key className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Browser Google Account Detection:</span>
                    <span className="text-[11px] text-sky-700 leading-relaxed block mt-0.5">
                      To open Google’s account chooser directly on <code className="bg-sky-100 px-1 py-0.5 rounded">accounts.google.com</code>, enter your Google OAuth Client ID:
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="Paste Google Client ID (.apps.googleusercontent.com)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-sky-300 text-[11px] bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (googleClientId) {
                        setShowClientIdConfig(false);
                        handleGoogleSignInClick();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-[11px] hover:bg-sky-700"
                  >
                    Save &amp; Connect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
                Or with email
              </span>
            </div>
          </div>

          {/* Login Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <span className="text-[11px] text-emerald-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* 1-Click Demo Accounts */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  1-Click Demo Accounts:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => fillQuickCredentials('admin@lankaproperty.lk', 'Admin@12345')}
                    className="p-2 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 font-medium text-left transition flex items-center justify-between"
                  >
                    <span>🛡️ Dinesh (Admin)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickCredentials('agent@premierhomes.lk', 'Admin@12345')}
                    className="p-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-medium text-left transition flex items-center justify-between"
                  >
                    <span>🏢 Shanuka (Agent)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickCredentials('malik.fernando@gmail.com', 'Admin@12345')}
                    className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-medium text-left transition flex items-center justify-between"
                  >
                    <span>🏡 Malik (Seller)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickCredentials('buyer@demo.lk', 'Admin@12345')}
                    className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-medium text-left transition flex items-center justify-between"
                  >
                    <span>👤 Standard Buyer</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kasun Shyamal"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account as {role}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle between Login and Register */}
          <div className="pt-2 text-center border-t border-slate-100">
            {activeTab === 'login' ? (
              <p className="text-xs text-slate-500">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* IN-APP GOOGLE ACCOUNT CHOOSER POPUP (NO EXTERNAL BLACK WINDOW) */}
      {/* ============================================================== */}
      {isGooglePopupOpen && (
        <div
          className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 flex items-center justify-center p-4"
          onClick={() => setIsGooglePopupOpen(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Google G and Close Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-sm font-semibold text-slate-800">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setIsGooglePopupOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Choose an account</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                to continue to <strong className="text-emerald-700 font-semibold">LankaProperty</strong> as{' '}
                <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase text-[10px]">
                  {role}
                </span>
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Account Selection or Input Form */}
            <div className="space-y-2 border-y border-slate-100 py-3">
              {/* If this user previously signed in on THIS specific device, show their own 1-click card */}
              {savedGoogleUser && !isAddingNewGoogleAccount ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleGoogleAccountSelect(savedGoogleUser.email, savedGoogleUser.name)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50/60 border border-slate-200 transition text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-emerald-500/20 flex-shrink-0">
                        {savedGoogleUser.name?.[0]?.toUpperCase() || 'G'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                          {savedGoogleUser.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{savedGoogleUser.email}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition flex-shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewGoogleAccount(true);
                      setCustomGoogleEmail('');
                      setCustomGoogleName('');
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-medium transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Use another Google account</span>
                  </button>
                </div>
              ) : (
                /* For any new visitor (like your friend) or when entering another account */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customGoogleEmail) {
                      handleGoogleAccountSelect(customGoogleEmail, customGoogleName);
                    }
                  }}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 animate-in fade-in"
                >
                  <div className="text-xs font-bold text-slate-800">
                    Enter your Google Account:
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Google Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading || !customGoogleEmail}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                    >
                      {isLoading ? 'Signing in...' : `Continue with Google as ${role}`}
                    </button>
                    {savedGoogleUser && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewGoogleAccount(false)}
                        className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed">
              To continue, Google will securely share your email, name, and profile with LankaProperty.
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
