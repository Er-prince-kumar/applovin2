import React from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  ArrowRight,
  Sparkles,
  Zap,
  Bell,
  Lock,
  Apple,
  Share2,
  ExternalLink,
} from 'lucide-react';
import DownloadClientSection from './DownloadClientSection';

export const metadata = {
  title: 'Download LinkEarn Mobile App | Android APK & iOS',
  description:
    'Download the official LinkEarn mobile app for Android and iOS. Track your monetization links, monitor real-time visitor traffic, and withdraw earnings on the go.',
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Nav */}
      <nav className="border-b border-[#1E2638] bg-[#0B0F17]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" showTagline={true} />

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              Back to Home
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-[#151B26] hover:bg-[#1E2638] border border-[#232D3F] text-xs font-semibold text-white transition-colors"
            >
              Web Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Official LinkEarn Mobile Application
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            Take Your Earnings <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Everywhere You Go
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Monitor verified clicks in real-time, generate smart links in 1-tap, and request instant
            disbursements right from your Android or iOS mobile phone.
          </p>

          {/* 1-Tap Instant Phone Install Card */}
          <div className="max-w-2xl mx-auto text-left">
            <div className="bg-[#151B26] border-2 border-emerald-500/50 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-8 h-8" />
                </div>
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-gray-950 shadow-md">
                  ★ INSTANT INSTALL
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Install App Directly to Phone</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Add LinkEarn to your Android or iPhone home screen with one tap. Enjoy full-screen performance, bottom tabs, live earnings updates, and zero parsing or file errors.
              </p>

              {/* Client Component with Native Install Prompt Hook */}
              <DownloadClientSection />

              <div className="mt-6 pt-5 border-t border-[#1E2638] flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  100% Error-Free Native Install
                </span>
                <span>Works on All Android & iOS Phones</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Highlights */}
      <section className="py-16 bg-[#0E131E] border-y border-[#1E2638]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              Optimized Mobile Experience
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Why Use The LinkEarn App?</h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-5">
              <Zap className="w-7 h-7 text-emerald-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">1-Tap Link Monetization</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Paste any article or URL while browsing and generate a tracking direct link in seconds.
              </p>
            </div>

            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-5">
              <Bell className="w-7 h-7 text-blue-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Instant Push Notifications</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Receive notifications when you hit payout thresholds or when disbursements are paid out.
              </p>
            </div>

            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-5">
              <Lock className="w-7 h-7 text-purple-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Biometric Security</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Unlock your earnings ledger securely using fingerprint or Face ID authentication.
              </p>
            </div>

            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-5">
              <Smartphone className="w-7 h-7 text-amber-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Native Bottom Navigation</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Ergonomic bottom tabs designed for rapid one-thumb switching on phones of all sizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Installation Guide */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <h3 className="text-2xl font-bold text-white text-center mb-8">
          Android APK Installation in 3 Steps
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Download APK</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tap the &quot;Download Android APK&quot; button above to save <strong className="text-gray-300">LinkEarn-Publisher-v1.0.0.apk</strong> to your device.
            </p>
          </div>

          <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Confirm Install</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Open your browser downloads, tap the APK file, and click &quot;Install&quot; (enable &quot;Allow from this source&quot; if prompted).
            </p>
          </div>

          <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Start Monetizing</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Launch LinkEarn from your phone apps screen, sign in with your credentials, and monitor your traffic live!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1E2638] bg-[#080B11] py-8 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} LinkEarn. Turn genuine traffic into measurable earnings.</p>
      </footer>
    </div>
  );
}
