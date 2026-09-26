'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
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
      </div>
    </div>
  );
}
