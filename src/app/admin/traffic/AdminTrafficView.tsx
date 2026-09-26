'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Activity, Search, RefreshCw } from 'lucide-react';
import { formatNumber, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface TrafficViewProps {
  initialClicks: any[];
  counts: {
    valid: number;
    suspicious: number;
    invalid: number;
    total: number;
  };
}

export default function AdminTrafficView({ initialClicks, counts }: TrafficViewProps) {
  const [clicks, setClicks] = useState<any[]>(initialClicks);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const filteredClicks = clicks.filter((c) => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch =
      c.link.name.toLowerCase().includes(search.toLowerCase()) ||
      c.link.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.fraudReason && c.fraudReason.toLowerCase().includes(search.toLowerCase())) ||
      (c.ipAddress && c.ipAddress.includes(search)) ||
      (c.country && c.country.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  async function handleRefresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/traffic?status=${filter}&limit=100`);
      if (!res.ok) throw new Error('Failed to refresh');
      const json = await res.json();
      setClicks(json.clicks);
      toast('Traffic log refreshed', 'info');
    } catch {
      toast('Failed to refresh log', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter('ALL')}
          className={`cursor-pointer bg-[#151B26] border rounded-2xl p-4 transition-all ${
            filter === 'ALL' ? 'border-purple-500/50 bg-[#192233]' : 'border-[#232D3F] hover:border-gray-600'
          }`}
        >
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Inspected
          </div>
          <div className="text-2xl font-bold text-white mt-1">{formatNumber(counts.total)}</div>
          <div className="text-[11px] text-gray-400 mt-1">100% of network requests</div>
        </div>

        <div
          onClick={() => setFilter('VALID')}
          className={`cursor-pointer bg-[#151B26] border rounded-2xl p-4 transition-all ${
            filter === 'VALID' ? 'border-emerald-500/50 bg-[#12231E]' : 'border-[#232D3F] hover:border-gray-600'
          }`}
        >
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Valid Traffic</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{formatNumber(counts.valid)}</div>
          <div className="text-[11px] text-gray-400 mt-1">
            {counts.total > 0 ? ((counts.valid / counts.total) * 100).toFixed(1) : 0}% payable
          </div>
        </div>

        <div
          onClick={() => setFilter('SUSPICIOUS')}
          className={`cursor-pointer bg-[#151B26] border rounded-2xl p-4 transition-all ${
            filter === 'SUSPICIOUS' ? 'border-amber-500/50 bg-[#282116]' : 'border-[#232D3F] hover:border-gray-600'
          }`}
        >
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>Suspicious Bursts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-1">{formatNumber(counts.suspicious)}</div>
          <div className="text-[11px] text-gray-400 mt-1">Excluded from earnings</div>
        </div>

        <div
          onClick={() => setFilter('INVALID')}
          className={`cursor-pointer bg-[#151B26] border rounded-2xl p-4 transition-all ${
            filter === 'INVALID' ? 'border-red-500/50 bg-[#281618]' : 'border-[#232D3F] hover:border-gray-600'
          }`}
        >
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>Invalid / Bots</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-1">{formatNumber(counts.invalid)}</div>
          <div className="text-[11px] text-gray-400 mt-1">Automated bots blocked</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#151B26] border border-[#232D3F] rounded-2xl p-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by link slug, IP address, country, or fraud reason..."
            className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0D121C] border border-[#232D3F] rounded-xl p-1 text-xs">
            {['ALL', 'VALID', 'SUSPICIOUS', 'INVALID'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === st ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            title="Refresh Feed"
            className="p-2.5 rounded-xl bg-[#0D121C] border border-[#232D3F] text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Traffic Table */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#232D3F] text-gray-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 font-semibold">Timestamp</th>
              <th className="pb-3 font-semibold">Link & Publisher</th>
              <th className="pb-3 font-semibold">Classification</th>
              <th className="pb-3 font-semibold">Fraud Reason / Pattern</th>
              <th className="pb-3 font-semibold">Fingerprint Details</th>
              <th className="pb-3 font-semibold">Referrer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638]">
            {filteredClicks.map((click) => (
              <tr key={click.id} className="hover:bg-[#111622] transition-colors">
                <td className="py-3.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                  {formatDateTime(click.createdAt)}
                </td>
                <td className="py-3.5">
                  <div className="font-semibold text-white">{click.link.name}</div>
                  <div className="text-[11px] text-emerald-400 font-mono">/go/{click.link.slug}</div>
                  <div className="text-[10px] text-gray-400">Owner: {click.link.user.name}</div>
                </td>
                <td className="py-3.5">
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      click.status === 'VALID'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : click.status === 'SUSPICIOUS'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {click.status}
                  </span>
                </td>
                <td className="py-3.5 max-w-xs">
                  {click.fraudReason ? (
                    <span className="text-amber-300 font-medium text-[11px]">
                      {click.fraudReason}
                    </span>
                  ) : (
                    <span className="text-gray-400">Passed all defensive filters</span>
                  )}
                </td>
                <td className="py-3.5 text-gray-300">
                  <div className="font-medium text-white">
                    {click.device} &bull; {click.browser} ({click.os})
                  </div>
                  <div className="text-[11px] font-mono text-gray-400">
                    IP: {click.ipAddress} &bull; Geo: {click.country}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 truncate max-w-[180px]">
                    Hash: {click.visitorHash}
                  </div>
                </td>
                <td className="py-3.5 max-w-[150px] truncate text-gray-400 font-mono text-[11px]">
                  {click.referrer || 'Direct'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
