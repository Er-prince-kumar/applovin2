'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Smartphone,
  CheckCircle2,
  Download,
  Check,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post-login install modal state
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [loggedInUserRole, setLoggedInUserRole] = useState<'USER' | 'ADMIN'>('USER');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [appInstalled, setAppInstalled] = useState(false);

  useEffect(() => {
    // Restore remembered email if available
    try {
      const savedEmail = localStorage.getItem('linkearn_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {}

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).__pwaPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      // Persist email in browser for 1-tap future logins
      try {
        if (rememberMe) {
          localStorage.setItem('linkearn_remembered_email', email.trim());
        } else {
          localStorage.removeItem('linkearn_remembered_email');
        }
      } catch {}

      // Check if already in standalone PWA app mode
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      const userRole = data.user?.role === 'ADMIN' ? 'ADMIN' : 'USER';
      setLoggedInUserRole(userRole);

      // Flag for dashboard prompt as well
      sessionStorage.setItem('showInstallPromptAfterLogin', 'true');

      if (!isStandalone) {
        // Show app install screen right after login
        setShowInstallPrompt(true);
      } else {
        // Direct navigation if already in app
        if (userRole === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleInstallApp() {
    const promptEvent = deferredPrompt || (window as any).__pwaPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('To install on iPhone (Safari):\n1. Tap the Share button (↑) at the bottom.\n2. Tap "Add to Home Screen".');
      } else {
        alert('To install on Android:\n1. Tap the 3 dots (⋮) in Chrome at top right.\n2. Tap "Install App" or "Add to Home screen".');
      }
    }
  }

  function handleProceedToDashboard() {
    if (loggedInUserRole === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
    router.refresh();
  }

  function fillDemoPublisher() {
    setEmail('publisher@linkearn.com');
    setPassword('Publisher123!');
    setError(null);
  }

  function fillDemoAdmin() {
    setEmail('admin@linkearn.com');
    setPassword('AdminSecure123!');
    setError(null);
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-center items-center p-6 relative">
      <div className="mb-8">
        <Logo size="lg" showTagline={true} />
      </div>

      <div className="w-full max-w-md bg-[#151B26] border border-[#232D3F] rounded-2xl p-8 shadow-2xl relative">
        {showInstallPrompt ? (
          /* Post-Login App Install Prompt */
          <div className="text-center py-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/25 flex items-center justify-center mx-auto mb-4">
              <div className="w-full h-full bg-[#0D121C] rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Login Successful!</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
              Install LinkEarn App
            </h2>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed">
              Apne mobile ya desktop par <strong>LinkEarn App</strong> install karein taaki aap 1-click me apne monetization dashboard aur earnings ko track kar sakein.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleInstallApp}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>{appInstalled ? '✓ App Installed!' : 'Install App Now (1-Tap)'}</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToDashboard}
                className="w-full py-3 px-4 rounded-xl bg-[#1F293D] hover:bg-[#28354E] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Continue to Web Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Login Form */
          <>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
            <p className="text-xs text-gray-400 mb-6">
              Sign in to manage your monetization links and monitor earnings.
            </p>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="publisher@linkearn.com"
                    className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-300 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#232D3F] bg-[#0D121C] text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span>Remember my login (30 days)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Fast Fill Pill Buttons */}
            <div className="mt-6 pt-5 border-t border-[#232D3F]">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                Quick Demo Credentials:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={fillDemoPublisher}
                  className="py-1.5 px-2.5 rounded-lg bg-[#141B27] border border-[#232D3F] hover:border-emerald-500/40 text-xs text-gray-300 hover:text-white transition-colors text-left"
                >
                  <div className="font-semibold text-emerald-400">Publisher</div>
                  <div className="text-[10px] text-gray-400 truncate">publisher@linkearn.com</div>
                </button>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="py-1.5 px-2.5 rounded-lg bg-[#141B27] border border-[#232D3F] hover:border-purple-500/40 text-xs text-gray-300 hover:text-white transition-colors text-left"
                >
                  <div className="font-semibold text-purple-400">Administrator</div>
                  <div className="text-[10px] text-gray-400 truncate">admin@linkearn.com</div>
                </button>
              </div>
            </div>

            <div className="text-center mt-6 text-xs text-gray-400">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="text-emerald-400 font-semibold hover:underline">
                Create Free Account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
