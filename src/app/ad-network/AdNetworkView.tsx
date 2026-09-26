'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Save,
  Play,
  RotateCw,
  ExternalLink,
  Layers,
  Smartphone,
  Cpu,
  Sliders,
  AlertTriangle,
  Code,
  Key,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface AdNetworkConfig {
  applovinSdkKey: string;
  applovinRewardedId: string;
  applovinInterstitialId: string;
  applovinBannerId: string;
  unityGameId: string;
  unityRewardedId: string;
  unityInterstitialId: string;
  admobAppId: string;
  admobRewardedUnitId: string;
  admobInterstitialUnitId: string;
  antiBanCtrLimit: number;
  minIntervalSeconds: number;
  dailyImpressionLimit: number;
  testMode: boolean;
  customAdScript: string;
}

interface AdNetworkViewProps {
  initialConfig: AdNetworkConfig;
}

export default function AdNetworkView({ initialConfig }: AdNetworkViewProps) {
  const [config, setConfig] = useState<AdNetworkConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof AdNetworkConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/ad-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Ad unit keys & Anti-Ban policies updated successfully!', 'success');
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err: any) {
      toast(err.message || 'Could not save ad network settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-purple-900/60 border border-blue-500/30 p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Ad Network Monetization Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              AppLovin MAX & Unity Ads SDK Settings
            </h1>
            <p className="text-gray-300 text-sm max-w-2xl">
              Configure your Publisher Keys, Game IDs, and Placement Units for AppLovin MAX, Unity
              Ads, and Google AdMob. Equipped with automated Anti-Ban CTR algorithms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/tasks"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Test Live Ads</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Anti-Ban Policy Warning */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed space-y-1">
          <div className="font-bold text-amber-300">
            Anti-Ban Safety Advisory (Unity & AppLovin Guidelines)
          </div>
          <div>
            Ad networks flag accounts when Click-Through-Rate (CTR) exceeds 2.5% or impressions fire too rapidly.
            Our smart streamer automatically throttles traffic, enforces randomized delays (20-40s), and locks maximum CTR to your chosen threshold.
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AppLovin MAX Card */}
        <div className="rounded-2xl bg-[#0D121C] border border-[#1E2638] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-sm">
                AL
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>AppLovin MAX SDK</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </h2>
                <p className="text-xs text-gray-400">Header bidding & rewarded video mediation</p>
              </div>
            </div>
            <a
              href="https://dash.applovin.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>AppLovin Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                AppLovin MAX SDK Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={config.applovinSdkKey}
                  onChange={(e) => handleChange('applovinSdkKey', e.target.value)}
                  placeholder="sdk_key_xxxxxxxxxxxxxxxx"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Rewarded Video Ad Unit ID
              </label>
              <input
                type="text"
                value={config.applovinRewardedId}
                onChange={(e) => handleChange('applovinRewardedId', e.target.value)}
                placeholder="rewarded_placement_id"
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Interstitial Ad Unit ID
              </label>
              <input
                type="text"
                value={config.applovinInterstitialId}
                onChange={(e) => handleChange('applovinInterstitialId', e.target.value)}
                placeholder="interstitial_placement_id"
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Banner Ad Unit ID
              </label>
              <input
                type="text"
                value={config.applovinBannerId}
                onChange={(e) => handleChange('applovinBannerId', e.target.value)}
                placeholder="banner_placement_id"
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Unity Ads Card */}
        <div className="rounded-2xl bg-[#0D121C] border border-[#1E2638] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-black text-purple-400 text-sm">
                UA
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Unity Ads Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    High eCPM
                  </span>
                </h2>
                <p className="text-xs text-gray-400">Unity 3D Game & App video monetization</p>
              </div>
            </div>
            <a
              href="https://cloud.unity.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Unity Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Unity Game ID
              </label>
              <input
                type="text"
                value={config.unityGameId}
                onChange={(e) => handleChange('unityGameId', e.target.value)}
                placeholder="e.g. 5482910"
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Unity Rewarded Placement ID
              </label>
              <input
                type="text"
                value={config.unityRewardedId}
                onChange={(e) => handleChange('unityRewardedId', e.target.value)}
                placeholder="Rewarded_Android"
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Unity Interstitial Placement ID
              </label>
              <input
                type="text"
                value={config.unityInterstitialId}
                onChange={(e) => handleChange('unityInterstitialId', e.target.value)}
                placeholder="Interstitial_Android"
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Google AdMob Card */}
        <div className="rounded-2xl bg-[#0D121C] border border-[#1E2638] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-sm">
                AM
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Google AdMob Integration</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Global Fill
                  </span>
                </h2>
                <p className="text-xs text-gray-400">Official Google AdMob fallback and mediation</p>
              </div>
            </div>
            <a
              href="https://admob.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>AdMob Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                AdMob App ID
              </label>
              <input
                type="text"
                value={config.admobAppId}
                onChange={(e) => handleChange('admobAppId', e.target.value)}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                AdMob Rewarded Unit ID
              </label>
              <input
                type="text"
                value={config.admobRewardedUnitId}
                onChange={(e) => handleChange('admobRewardedUnitId', e.target.value)}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                AdMob Interstitial Unit ID
              </label>
              <input
                type="text"
                value={config.admobInterstitialUnitId}
                onChange={(e) => handleChange('admobInterstitialUnitId', e.target.value)}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Anti-Ban & Frequency Control */}
        <div className="rounded-2xl bg-[#0D121C] border border-[#1E2638] p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-[#1E2638] pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Anti-Ban & Impression Safeguards</h2>
              <p className="text-xs text-gray-400">
                Automated protections to ensure account survival & payment approvals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Max CTR Limit (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5"
                  value={config.antiBanCtrLimit}
                  onChange={(e) => handleChange('antiBanCtrLimit', parseFloat(e.target.value) || 1.5)}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-gray-400 font-mono">%</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Recommended: &le; 1.5% to avoid account bans.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Min Delay Between Impressions
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={config.minIntervalSeconds}
                  onChange={(e) =>
                    handleChange('minIntervalSeconds', parseInt(e.target.value, 10) || 25)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-gray-400 font-mono">sec</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Simulates real human viewing patterns.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Daily Limit Per User
              </label>
              <input
                type="number"
                min="5"
                max="500"
                value={config.dailyImpressionLimit}
                onChange={(e) =>
                  handleChange('dailyImpressionLimit', parseInt(e.target.value, 10) || 50)
                }
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-[#1E2638] text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">Caps daily impression rewards per user.</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="testMode"
                checked={config.testMode}
                onChange={(e) => handleChange('testMode', e.target.checked)}
                className="w-4 h-4 rounded border-[#1E2638] bg-[#090D16] text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="testMode" className="text-xs text-gray-300 cursor-pointer select-none">
                <span className="font-semibold text-white">Enable Test Mode / Demo Simulation</span>
                <span className="block text-[11px] text-gray-400">
                  Allows testing without serving live ad revenue strikes during testing
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/tasks"
            className="px-5 py-2.5 rounded-xl bg-[#1E2638] hover:bg-[#28334b] text-gray-300 font-semibold text-xs transition-colors"
          >
            Go to Ad Tasks
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Ad Network Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
