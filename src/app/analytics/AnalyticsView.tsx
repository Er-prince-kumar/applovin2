'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Filter,
  DollarSign,
  MousePointerClick,
  Users,
  Percent,
  Globe2,
  Monitor,
  Share2,
  RefreshCw,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import EarningsChart from '@/components/charts/EarningsChart';
import TrafficChart from '@/components/charts/TrafficChart';
import DeviceDistributionChart from '@/components/charts/DeviceDistributionChart';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface LinkOption {
  id: string;
  name: string;
  slug: string;
}

interface AnalyticsViewProps {
  links: LinkOption[];
}

export default function AnalyticsView({ links }: AnalyticsViewProps) {
  const [range, setRange] = useState('7d');
  const [selectedLinkId, setSelectedLinkId] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('range', range);
      if (selectedLinkId) params.set('linkId', selectedLinkId);

      const res = await fetch(`/api/analytics?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load metrics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, [range, selectedLinkId]);

  const ranges = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'month', label: 'This Month' },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#151B26] border border-[#232D3F] rounded-2xl p-4 shadow-lg">
        {/* Date Range Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                range === r.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#1E2638]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Link Selector & Refresh */}
        <div className="flex items-center gap-3">
          <select
            value={selectedLinkId}
            onChange={(e) => setSelectedLinkId(e.target.value)}
            className="bg-[#0D121C] border border-[#232D3F] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 max-w-xs"
          >
            <option value="">All Monetized Links ({links.length})</option>
            {links.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} (/go/{l.slug})
              </option>
            ))}
          </select>

          <button
            onClick={fetchAnalytics}
            title="Refresh analytics data"
            className="p-2 rounded-xl bg-[#0D121C] border border-[#232D3F] text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Period Yield"
          value={formatCurrency(data?.summary?.totalEarnings || 0)}
          subtitle="Net publisher credit"
          icon={DollarSign}
          accent="green"
        />

        <StatCard
          title="Total Clicks"
          value={formatNumber(data?.summary?.totalClicks || 0)}
          subtitle={`${formatNumber(data?.summary?.validClicks || 0)} marked VALID`}
          icon={MousePointerClick}
          accent="blue"
        />

        <StatCard
          title="Unique Visitors"
          value={formatNumber(data?.summary?.uniqueVisitors || 0)}
          subtitle={`CTR: ${data?.summary?.ctr || 0}%`}
          icon={Users}
          accent="purple"
        />

        <StatCard
          title="Conversion Rate"
          value={`${data?.summary?.conversionRate || 0}%`}
          subtitle="Target action conversions"
          icon={Percent}
          accent="amber"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Earnings Over Time</h3>
            <p className="text-xs text-gray-400">Revenue trajectory for chosen date window</p>
          </div>
          <EarningsChart data={data?.timeSeries || []} />
        </div>

        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Traffic Volume</h3>
            <p className="text-xs text-gray-400">Total clicks vs unique visitors</p>
          </div>
          <TrafficChart data={data?.timeSeries || []} />
        </div>
      </div>

      {/* Demographics & Deep Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Device Breakdown</h3>
          </div>
          <DeviceDistributionChart data={data?.deviceDistribution || []} height={220} />
        </div>

        {/* Country Breakdown */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Top Geographies</h3>
          </div>
          <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
            {data?.countryDistribution?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No location records</p>
            ) : (
              data?.countryDistribution?.map((c: any) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0D121C] text-xs"
                >
                  <span className="font-semibold text-white">{c.name}</span>
                  <span className="text-gray-400">{formatNumber(c.value)} clicks</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Referrer Sources */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Top Referrers</h3>
          </div>
          <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
            {data?.topReferrers?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No referrer data</p>
            ) : (
              data?.topReferrers?.map((r: any) => (
                <div
                  key={r.source}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0D121C] text-xs gap-2"
                >
                  <span className="text-gray-300 truncate font-mono text-[11px]">
                    {r.source}
                  </span>
                  <span className="text-emerald-400 font-bold shrink-0">
                    {formatNumber(r.count)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
