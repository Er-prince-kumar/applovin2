import React from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe2,
  Users2,
  DollarSign,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  Lock,
  Sparkles,
  Smartphone,
  Download,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navigation */}
      <nav className="border-b border-[#1E2638] bg-[#0B0F17]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" showTagline={true} />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#models" className="hover:text-emerald-400 transition-colors">
              Earning Models
            </a>
            <a href="#payouts" className="hover:text-emerald-400 transition-colors">
              Payouts
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </a>
            <Link
              href="/download"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/download"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white text-xs font-semibold border border-[#232D3F] hover:border-gray-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get APK</span>
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-gray-300 hover:text-white font-medium text-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Legitimate Affiliate Traffic Monetization
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Monetize Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Genuine Traffic
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create smart links, understand your audience and track your earnings from one powerful
            dashboard. Designed exclusively for real users and authentic traffic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-base transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/download"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#151B26] hover:bg-[#1E2638] text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 font-bold text-base transition-all flex items-center justify-center gap-2.5 shadow-lg group"
            >
              <Smartphone className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Download App (APK)</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#0F141F] hover:bg-[#151B26] text-gray-300 hover:text-white border border-[#232D3F] font-semibold text-base transition-colors"
            >
              Login to Account
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-14 pt-8 border-t border-[#1E2638]/60 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left max-w-3xl mx-auto">
            <div>
              <div className="text-2xl font-bold text-white">$0.05 - $14.00</div>
              <div className="text-xs text-gray-400">Competitive CPC & CPA Rates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">$10.00 Min</div>
              <div className="text-xs text-gray-400">Fast Low-Threshold Payouts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">100% Real-Time</div>
              <div className="text-xs text-gray-400">Granular Click Analytics</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">5.0% Bonus</div>
              <div className="text-xs text-gray-400">Lifetime Referral Cut</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#0E131E] border-y border-[#1E2638]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              Simple 3-Step Process
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">How LinkEarn Works</h3>
            <p className="text-gray-400 text-sm mt-3">
              Start earning from your authentic website, social media, or community visitors in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-7 relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center mb-5">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Create Smart Links</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Input any destination URL. LinkEarn generates a unique, lightning-fast monetized link
                associated with verified programmatic ad campaigns.
              </p>
            </div>

            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-7 relative">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-xl flex items-center justify-center mb-5">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Share With Real Audiences</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Distribute your links across your blogs, newsletters, Discord channels, or YouTube descriptions.
                Our defensive traffic engine verifies every visitor automatically.
              </p>
            </div>

            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-7 relative">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-xl flex items-center justify-center mb-5">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Track & Withdraw</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Watch your ledger balance update in real time. Request withdrawals as soon as you reach
                $10 via PayPal, Wire Transfer, Crypto USDT, or Payoneer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              Industry Standard Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Built for High Volume & Trust</h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Automated Fraud Filtering</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Multi-layer inspection shields against web scrapers, automated clicks, and burst frequencies, ensuring advertisers always pay top dollar for your genuine traffic.
              </p>
            </div>

            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6">
              <BarChart3 className="w-8 h-8 text-blue-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Granular Demographics</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Break down clicks by device (Desktop, Mobile, Tablet), operating system, browser, referrer source, and geographic location in real time.
              </p>
            </div>

            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6">
              <Lock className="w-8 h-8 text-purple-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Immutable Earning Ledger</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Every validated click and conversion generates a cryptographic transaction record in your ledger. Payout records are completely transparent.
              </p>
            </div>

            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6">
              <Zap className="w-8 h-8 text-amber-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Sub-Millisecond Redirects</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your visitors experience instant routing to target destinations with zero deceptive intermediaries, forced downloads, or interstitial traps.
              </p>
            </div>

            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6">
              <Users2 className="w-8 h-8 text-teal-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">5% Lifetime Referrals</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Invite fellow creators or publishers using your personal referral link and receive a permanent 5% commission on their verified traffic revenue.
              </p>
            </div>

            <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6">
              <DollarSign className="w-8 h-8 text-emerald-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Multi-Channel Payouts</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Receive funds seamlessly via PayPal MassPay, International Bank Wire, TRC20 USDT cryptocurrency, or Payoneer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payout Channels */}
      <section id="payouts" className="py-16 bg-[#0E131E] border-t border-[#1E2638]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-xl font-bold text-white mb-3">Supported Payout Providers</h3>
          <p className="text-xs text-gray-400 mb-8">
            Withdraw your funds reliably with a low $10 minimum threshold
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-4 flex flex-col items-center justify-center">
              <div className="text-blue-400 font-bold text-base">PayPal</div>
              <div className="text-[11px] text-gray-400 mt-1">Instant MassPay</div>
            </div>
            <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-4 flex flex-col items-center justify-center">
              <div className="text-emerald-400 font-bold text-base">USDT TRC20</div>
              <div className="text-[11px] text-gray-400 mt-1">Fast Crypto Payouts</div>
            </div>
            <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-4 flex flex-col items-center justify-center">
              <div className="text-purple-400 font-bold text-base">Bank Wire</div>
              <div className="text-[11px] text-gray-400 mt-1">SWIFT / ACH Direct</div>
            </div>
            <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-4 flex flex-col items-center justify-center">
              <div className="text-amber-400 font-bold text-base">Payoneer</div>
              <div className="text-[11px] text-gray-400 mt-1">Global Accounts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Download Banner & Showcase */}
      <section className="py-20 bg-gradient-to-b from-[#0E131E] to-[#0B0F17] border-t border-[#1E2638] relative overflow-hidden">
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="bg-[#141A26] border border-[#222C3E] rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Smartphone className="w-3.5 h-3.5" />
                Official Mobile App Available
              </div>

              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                Manage Your Links & Earnings on the Go
              </h3>

              <p className="text-sm sm:text-base text-gray-400 mb-8 leading-relaxed">
                Download the official LinkEarn Android APK directly to your phone. Create links with one tap, inspect live click analytics, and request withdrawals from anywhere.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href="/api/download/apk"
                  download="LinkEarn-Publisher-v1.0.0.apk"
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 hover:scale-[1.02]"
                >
                  <Download className="w-5 h-5" />
                  <span>Download APK (v1.0.0)</span>
                </a>

                <Link
                  href="/download"
                  className="px-6 py-3.5 rounded-xl bg-[#1C2433] hover:bg-[#253044] text-white border border-[#2E3C56] font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Download Hub & iOS Guide</span>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Direct Download &bull; No App Store Account Needed
                </span>
                <span className="text-gray-600">&bull;</span>
                <span>Android 8.0+ Compatible</span>
              </div>
            </div>

            {/* Visual Mobile Phone Mockup */}
            <div className="w-full max-w-[280px] bg-[#0B0F17] border-4 border-[#232D3F] rounded-[40px] p-4 shadow-2xl relative">
              <div className="w-24 h-4 bg-[#232D3F] rounded-full mx-auto mb-4" />
              <div className="bg-[#151B26] rounded-2xl p-4 border border-[#232D3F] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white">LinkEarn Mobile</div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="bg-[#0B0F17] rounded-xl p-3 border border-[#1E2638]">
                  <div className="text-[10px] text-gray-400 uppercase">Today&apos;s Earnings</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">$84.50</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">+18.4% vs yesterday</div>
                </div>
                <div className="bg-[#0B0F17] rounded-xl p-3 border border-[#1E2638]">
                  <div className="text-[10px] text-gray-400 uppercase">Verified Clicks</div>
                  <div className="text-base font-bold text-white mt-0.5">1,420</div>
                </div>
                <a
                  href="/api/download/apk"
                  download="LinkEarn-Publisher-v1.0.0.apk"
                  className="block text-center py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Download App Now
                </a>
              </div>
              <div className="w-28 h-1 bg-[#232D3F] rounded-full mx-auto mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            Frequently Asked Questions
          </h2>
          <h3 className="text-3xl font-extrabold text-white">Got Questions? We Have Answers.</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-5">
            <h4 className="text-sm font-bold text-white mb-2">What traffic is eligible for monetization?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We welcome genuine, human traffic originating from blogs, forums, news sites, content platforms, email newsletters, and social media. Automated traffic, bot clicks, proxy networks, and forced redirects are blocked by our traffic engine.
            </p>
          </div>

          <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-5">
            <h4 className="text-sm font-bold text-white mb-2">How do the earning models (CPC, CPM, CPA) work?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              In CPC campaigns, you earn a set rate for every valid visitor click. In CPM campaigns, you are rewarded per 1,000 verified impressions. In CPA campaigns, earnings are credited when visitors complete a verified target action.
            </p>
          </div>

          <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-5">
            <h4 className="text-sm font-bold text-white mb-2">When and how can I withdraw my earnings?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              The minimum payout threshold is $10.00. You can submit withdrawal requests at any time to your PayPal account, USDT crypto address, bank account, or Payoneer.
            </p>
          </div>

          <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-5">
            <h4 className="text-sm font-bold text-white mb-2">How does the referral program work?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Share your unique referral URL with peers or other creators. Whenever a referred publisher earns revenue through their links, you receive a 5% bonus paid directly by the platform.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1E2638] bg-[#080B11] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" showTagline={true} />

          <div className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} LinkEarn. Turn genuine traffic into measurable earnings. All rights reserved.
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/download" className="hover:text-emerald-400 text-gray-300 transition-colors flex items-center gap-1 font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download App</span>
            </Link>
            <Link href="/login" className="hover:text-white">
              Login
            </Link>
            <Link href="/register" className="hover:text-white">
              Publisher Sign Up
            </Link>
            <Link href="/support" className="hover:text-white">
              Support & Guidelines
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
