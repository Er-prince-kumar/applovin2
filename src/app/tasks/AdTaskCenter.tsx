'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Zap,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Smartphone,
  RotateCw,
  Gift,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  Settings,
  Layers,
  Clock,
  Coins,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { ADSTERRA_SMARTLINKS, getSmartlinkWithSubId } from '@/lib/adsterra';

interface AdTaskCenterProps {
  initialUser: {
    id: string;
    name: string;
    availableBalance: number;
    lifetimeEarnings: number;
  };
  initialAdsWatchedToday?: number;
}

// Dedicated Smartlink 2 for Task Center Placements
export const SMARTLINK_2_URL = getSmartlinkWithSubId(
  ADSTERRA_SMARTLINKS.SMARTLINK_2.baseUrl,
  'task_center_sponsor_stream'
);

export const SMARTLINK_2_CTA_URL = getSmartlinkWithSubId(
  ADSTERRA_SMARTLINKS.SMARTLINK_2.baseUrl,
  'task_center_rewarded_cta'
);

export const MONETAG_AD_LINKS = [
  SMARTLINK_2_URL,
  getSmartlinkWithSubId(ADSTERRA_SMARTLINKS.SMARTLINK_1.baseUrl, 'task_center_alt_stream1'),
  getSmartlinkWithSubId(ADSTERRA_SMARTLINKS.SMARTLINK_3.baseUrl, 'task_center_alt_stream3'),
];

export function getRandomAdLink(): string {
  return SMARTLINK_2_URL;
}

const AD_CREATIVES = [
  {
    title: 'Kingdom Rush: Tower Defense',
    category: 'Mobile Strategy Game',
    rating: '4.8 ★★★★★',
    installs: '10M+ Downloads',
    description: 'Build towers, recruit legendary heroes, and battle orc hordes!',
    color: 'from-amber-600 to-red-600',
    cta: 'Open Link',
    network: 'Adsterra Sponsor',
    adUrl: SMARTLINK_2_CTA_URL,
  },
  {
    title: 'TradePro: Crypto & Stocks',
    category: 'Finance & Trading',
    rating: '4.7 ★★★★★',
    installs: '5M+ Downloads',
    description: 'Zero commission trading on Bitcoin, Gold, and Tech Stocks.',
    color: 'from-blue-600 to-cyan-600',
    cta: 'Open Link',
    network: 'Featured Partner',
    adUrl: SMARTLINK_2_CTA_URL,
  },
  {
    title: 'Cyberpunk Runner 2077',
    category: 'Action Arcade',
    rating: '4.9 ★★★★★',
    installs: '2M+ Downloads',
    description: 'Sprint through futuristic neon cityscapes and dodge obstacles!',
    color: 'from-purple-600 to-pink-600',
    cta: 'Open Link',
    network: 'Verified Sponsor',
    adUrl: SMARTLINK_2_CTA_URL,
  },
];

export default function AdTaskCenter({
  initialUser,
  initialAdsWatchedToday = 0,
}: AdTaskCenterProps) {
  const { toast } = useToast();
  const sessionKey = `linkearn_ad_session_${initialUser.id}`;

  const [balance, setBalance] = useState(initialUser.availableBalance);
  const [adsWatchedToday, setAdsWatchedToday] = useState(initialAdsWatchedToday);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [currentAdType, setCurrentAdType] = useState<'REWARDED_VIDEO' | 'INTERSTITIAL'>('REWARDED_VIDEO');
  const [adSecondsRemaining, setAdSecondsRemaining] = useState(30);
  const [canCloseAd, setCanCloseAd] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCreativeIndex, setCurrentCreativeIndex] = useState(0);

  // Auto-Impression Stream state - persisted across refreshes
  const [autoStreamActive, setAutoStreamActive] = useState(false);
  const [autoInterval, setAutoInterval] = useState(25);
  const [autoCountdown, setAutoCountdown] = useState(25);
  const [autoCompletedCount, setAutoCompletedCount] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const val = localStorage.getItem(`${sessionKey}_count`);
        return val ? parseInt(val, 10) : 0;
      } catch {}
    }
    return 0;
  });
  const [autoEarnedSession, setAutoEarnedSession] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const val = localStorage.getItem(`${sessionKey}_earned`);
        return val ? parseFloat(val) : 0;
      } catch {}
    }
    return 0;
  });

  // Keep localStorage in sync with session earnings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${sessionKey}_count`, String(autoCompletedCount));
        localStorage.setItem(`${sessionKey}_earned`, String(autoEarnedSession));
      } catch {}
    }
  }, [autoCompletedCount, autoEarnedSession, sessionKey]);

  // Lucky Spin & Scratch Card state
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [scratchReward, setScratchReward] = useState<number | null>(null);

  // Active video ad timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Rewarded Video Ad Play (Real user intentional action: No unsolicited popups)
  function startRewardedVideo() {
    setCurrentAdType('REWARDED_VIDEO');
    setAdSecondsRemaining(30);
    setCanCloseAd(false);
    const nextIndex = (currentCreativeIndex + 1) % AD_CREATIVES.length;
    setCurrentCreativeIndex(nextIndex);
    setIsAdPlaying(true);
  }

  // Handle Interstitial Ad Play (Real user intentional action: No unsolicited popups)
  function startInterstitial() {
    setCurrentAdType('INTERSTITIAL');
    setAdSecondsRemaining(8);
    setCanCloseAd(false);
    const nextIndex = (currentCreativeIndex + 1) % AD_CREATIVES.length;
    setCurrentCreativeIndex(nextIndex);
    setIsAdPlaying(true);
  }

  // Ad Countdown Logic
  useEffect(() => {
    if (!isAdPlaying) return;

    timerRef.current = setInterval(() => {
      setAdSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanCloseAd(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAdPlaying]);

  // Claim Reward from Server
  async function claimReward(type: string, duration: number) {
    try {
      const creative = AD_CREATIVES[currentCreativeIndex];
      const res = await fetch('/api/tasks/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: type,
          durationSeconds: duration,
          adNetwork: creative.network,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBalance(data.availableBalance);
        setAdsWatchedToday((prev) => prev + 1);
        toast(data.message, 'success');
      } else {
        toast(data.error || 'Failed to claim reward', 'error');
      }
    } catch (err) {
      toast('Network error claiming reward', 'error');
    }
  }

  function handleCloseAd() {
    if (!canCloseAd && adSecondsRemaining > 0) return;

    setIsAdPlaying(false);
    claimReward(currentAdType, currentAdType === 'REWARDED_VIDEO' ? 30 : 8);
  }

  // Auto-Impression Engine Loop
  useEffect(() => {
    if (!autoStreamActive) {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      return;
    }

    autoTimerRef.current = setInterval(async () => {
      setAutoCountdown((prev) => {
        if (prev <= 1) {
          // Trigger automated impression reward with random jitter
          const randomJitter = Math.floor(Math.random() * 5); // 0-4s random jitter
          claimReward('AUTO_IMPRESSION', autoInterval);
          setAutoCompletedCount((c) => c + 1);
          setAutoEarnedSession((e) => e + 0.008);
          return autoInterval + randomJitter;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [autoStreamActive, autoInterval]);

  // Handle Lucky Spin (No automatic popups)
  async function handleSpinWheel() {
    if (spinning) return;
    setSpinning(true);
    setSpinResult(null);

    // Watch mini ad requirement simulation
    setTimeout(async () => {
      try {
        const res = await fetch('/api/tasks/reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskType: 'LUCKY_SPIN',
            durationSeconds: 15,
            adNetwork: 'Adsterra Network',
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSpinResult(data.rewardAmount);
          setBalance(data.availableBalance);
          setAdsWatchedToday((prev) => prev + 1);
          toast(`🎡 Lucky Wheel Won: +$${data.rewardAmount.toFixed(3)}!`, 'success');
        }
      } finally {
        setSpinning(false);
      }
    }, 3000);
  }

  // Handle Scratch Card (No automatic popups)
  async function handleScratch() {
    if (scratchRevealed) {
      setScratchRevealed(false);
      setScratchReward(null);
      return;
    }

    const res = await fetch('/api/tasks/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskType: 'SCRATCH_CARD',
        durationSeconds: 10,
        adNetwork: 'Adsterra Network',
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setScratchReward(data.rewardAmount);
      setScratchRevealed(true);
      setBalance(data.availableBalance);
      setAdsWatchedToday((prev) => prev + 1);
      toast(`🎉 Card Scratched: +$${data.rewardAmount.toFixed(3)}!`, 'success');
    }
  }

  const creative = AD_CREATIVES[currentCreativeIndex];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Wallet Status */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-[#151C28] to-[#111722] border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Adsterra Rewarded Ad Center
          </div>
          <h2 className="text-2xl font-extrabold text-white">Watch Ads & Earn Instant Cash</h2>
          <p className="text-xs text-gray-400 mt-1">
            Complete rewarded video tasks, view interstitial promos, and stream auto-impressions.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0D121C] border border-[#232F48] rounded-xl p-4 self-stretch md:self-auto">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Available Wallet</div>
            <div className="text-2xl font-extrabold text-emerald-400">{formatCurrency(balance)}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              Today: <strong className="text-white">{adsWatchedToday} / 50</strong> Ads
            </div>
          </div>
          <Link
            href="/withdrawals"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            Withdraw Payout
          </Link>
        </div>
      </div>

      {/* Anti-Ban Safety Protection Status Card */}
      <div className="bg-[#121824] border border-[#232E44] rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Anti-Ban Protection Shield:</span>
              <span className="text-emerald-400 font-extrabold">Active (Safe 1.2% CTR)</span>
            </div>
            <div className="text-[11px] text-gray-400">
              Cooldown delays and randomized user agents enabled to protect publisher ad streams from invalid traffic.
            </div>
          </div>
        </div>

        <Link
          href="/links"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B2436] hover:bg-[#25324A] text-gray-300 hover:text-white border border-[#2B3952] text-xs font-medium transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-emerald-400" />
          <span>View My Smartlinks</span>
        </Link>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Watch Rewarded Video Ad Card */}
        <div className="bg-[#151B26] border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Play className="w-6 h-6 fill-emerald-400 stroke-none" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                +$0.05 / Ad
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Watch Rewarded Video</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Watch a full 30-second sponsored video ad to unlock an instant cash reward.
            </p>
          </div>

          <button
            onClick={startRewardedVideo}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <Play className="w-4 h-4 fill-gray-950 stroke-none" />
            <span>Play Rewarded Video</span>
          </button>
        </div>

        {/* 2. Show Interstitial Ad Card */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                +$0.02 / Ad
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Show Interstitial Ad</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Display a fast full-screen interstitial ad with a short 8-second view requirement.
            </p>
          </div>

          <button
            onClick={startInterstitial}
            className="w-full py-3 px-4 rounded-xl bg-[#1C2433] hover:bg-[#253044] text-white border border-[#2E3C56] font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Display Interstitial</span>
          </button>
        </div>

        {/* 3. Auto-Impression Streamer */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <RotateCw className={`w-6 h-6 ${autoStreamActive ? 'animate-spin' : ''}`} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {autoStreamActive ? '🟢 STREAMING' : 'PAUSED'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Auto-Impression Stream</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Automated task streamer that cycles ad impressions at safe intervals with randomized anti-ban delays.
            </p>

            {/* Auto Stream Stats */}
            <div className="bg-[#0D121C] border border-[#1E2638] rounded-xl p-3 mb-4 space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Next Impression in:</span>
                <span className="font-bold text-white">{autoCountdown}s</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Session Impressions:</span>
                <span className="font-bold text-emerald-400">{autoCompletedCount}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Session Earnings:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(autoEarnedSession)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setAutoStreamActive(!autoStreamActive)}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              autoStreamActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span>{autoStreamActive ? 'Stop Auto Stream' : 'Start Auto Stream'}</span>
          </button>
        </div>

        {/* 4. Lucky Spin Wheel */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Gift className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Win up to $0.25
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Daily Lucky Spin</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Spin the lucky reward wheel. Each spin requires viewing 1 quick ad and grants cash prizes.
            </p>

            {spinResult !== null && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center mb-4">
                <div className="text-xs text-emerald-400 font-bold">You Won: +${spinResult.toFixed(3)}!</div>
              </div>
            )}
          </div>

          <button
            onClick={handleSpinWheel}
            disabled={spinning}
            className="w-full py-3 px-4 rounded-xl bg-[#1C2433] hover:bg-[#253044] text-white border border-[#2E3C56] font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 text-amber-400 ${spinning ? 'animate-spin' : ''}`} />
            <span>{spinning ? 'Spinning...' : 'Spin the Wheel'}</span>
          </button>
        </div>

        {/* 5. Scratch & Win Card */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Scratch & Win
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Instant Scratch Card</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Scratch to reveal hidden cash rewards. Automatically claims credits upon card reveal.
            </p>

            {scratchRevealed && scratchReward && (
              <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-center mb-4">
                <div className="text-xs text-teal-400 font-bold">Revealed: +${scratchReward.toFixed(3)}!</div>
              </div>
            )}
          </div>

          <button
            onClick={handleScratch}
            className="w-full py-3 px-4 rounded-xl bg-[#1C2433] hover:bg-[#253044] text-white border border-[#2E3C56] font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>{scratchRevealed ? 'Scratch Next Card' : 'Scratch to Reveal'}</span>
          </button>
        </div>

        {/* 6. Active Adsterra Smartlinks Status */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Smartlinks
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Adsterra Smartlinks</h3>
            <div className="space-y-2 text-xs text-gray-300 mb-6">
              <div className="flex justify-between items-center bg-[#0D121C] p-2 rounded-lg border border-[#1E2638]">
                <span>Smartlink 1 (Landing)</span>
                <span className="text-emerald-400 font-semibold">● Active</span>
              </div>
              <div className="flex justify-between items-center bg-[#0D121C] p-2 rounded-lg border border-[#1E2638]">
                <span>Smartlink 2 (Task Hub)</span>
                <span className="text-emerald-400 font-semibold">● Active</span>
              </div>
              <div className="flex justify-between items-center bg-[#0D121C] p-2 rounded-lg border border-[#1E2638]">
                <span>Smartlink 3 (Mobile Hub)</span>
                <span className="text-emerald-400 font-semibold">● Active</span>
              </div>
            </div>
          </div>

          <Link
            href="/links"
            className="w-full py-3 px-4 rounded-xl bg-[#1C2433] hover:bg-[#253044] text-white border border-[#2E3C56] font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span>Manage Smartlinks</span>
          </Link>
        </div>
      </div>

      {/* Direct Monetization Ad Links Section (Smartlink 2 Placement) */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2638] pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Sponsored Partner Ad Streams</span>
            </h3>
            <p className="text-xs text-gray-400">
              Verified Adsterra smartlinks. Click below to view external sponsor promotions directly.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300 self-start sm:self-auto">
            Smartlink 2 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0D121C] border border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all group md:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Primary Stream &bull; Smartlink 2
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">External Sponsor Ad</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                Adsterra High-Yield Partner Ad Stream
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connects directly to verified advertising partner offers. Fully compliant with real user intentional clicks.
              </p>
            </div>

            <div className="pt-2 border-t border-[#1E2638] flex items-center gap-3">
              <a
                href={SMARTLINK_2_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Link (Opens sponsored partner offer in new window)"
                onClick={() => claimReward('AUTO_IMPRESSION', 15)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="bg-[#0D121C] border border-[#1E2638] rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Direct Hub
                </span>
                <span className="text-[11px] font-mono text-gray-400">Shortlink</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Publisher Ad Route
              </h4>
              <p className="text-xs text-gray-400 text-[11px]">
                Monetized routing via <code className="text-emerald-400">/go/ad</code>
              </p>
            </div>

            <div className="pt-2 border-t border-[#1E2638] flex items-center gap-2">
              <a
                href="/go/ad"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#1C2433] hover:bg-[#253044] text-white border border-[#2E3C56] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Shortlink Route</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN REALISTIC INTERACTIVE AD OVERLAY */}
      {isAdPlaying && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-300">
          {/* Top Bar of Ad Screen */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{creative.network} Rewarded Ad</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/60 text-white/80 hover:text-white border border-white/10 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Countdown or Close Button */}
              {canCloseAd ? (
                <button
                  onClick={handleCloseAd}
                  className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Claim & Close (X)</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span>Reward in {adSecondsRemaining}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Ad Creative Video Simulation Body */}
          <div className="my-auto max-w-lg mx-auto w-full text-center space-y-6">
            <div
              className={`w-full aspect-video rounded-3xl bg-gradient-to-tr ${creative.color} p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/20`}
            >
              <div className="text-left text-white space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                  {creative.category}
                </span>
                <h3 className="text-2xl font-black">{creative.title}</h3>
                <div className="text-xs text-white/90">{creative.rating} &bull; {creative.installs}</div>
              </div>

              <div className="text-white text-sm font-medium drop-shadow-md">
                &quot;{creative.description}&quot;
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[11px] text-white/80">Sponsored by {creative.network}</div>
                <a
                  href={SMARTLINK_2_CTA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Link (Opens sponsored partner offer in new window)"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-black text-xs hover:scale-105 transition-transform shadow-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Timer Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full transition-all duration-1000"
                  style={{
                    width: `${((30 - adSecondsRemaining) / 30) * 100}%`,
                  }}
                />
              </div>
              <div className="text-[11px] text-gray-400">
                {canCloseAd
                  ? '✓ Ad finished! Click Claim & Close above to receive your cash reward.'
                  : `Please wait ${adSecondsRemaining} seconds to complete verification...`}
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center text-[10px] text-gray-400">
            LinkEarn Rewarded Video Engine &bull; Compliant with Adsterra Publisher Policies
          </div>
        </div>
      )}
    </div>
  );
}
