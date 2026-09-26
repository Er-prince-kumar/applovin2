'use client';

import React, { useState } from 'react';
import { Search, Link2, ExternalLink, Power, DollarSign, MousePointerClick } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function AdminLinksView({ initialLinks }: { initialLinks: any[] }) {
  const [links, setLinks] = useState<any[]>(initialLinks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredLinks = links.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.slug.toLowerCase().includes(search.toLowerCase()) ||
      l.destinationUrl.toLowerCase().includes(search.toLowerCase()) ||
      l.user.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleToggle(link: any) {
    const nextStatus = link.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setLoadingId(link.id);

    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setLinks((prev) =>
        prev.map((item) => (item.id === link.id ? { ...item, status: nextStatus } : item))
      );
      toast(`Link ${link.slug} set to ${nextStatus}`, 'info');
    } catch {
      toast('Failed to change link status', 'error');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#151B26] border border-[#232D3F] rounded-2xl p-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links by slug, creator, destination..."
            className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center bg-[#0D121C] border border-[#232D3F] rounded-xl p-1 text-xs">
          {['ALL', 'ACTIVE', 'PAUSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#232D3F] text-gray-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 font-semibold">Link / Slug</th>
              <th className="pb-3 font-semibold">Publisher</th>
              <th className="pb-3 font-semibold">Campaign</th>
              <th className="pb-3 font-semibold">Destination URL</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right">Traffic</th>
              <th className="pb-3 font-semibold text-right">Yield</th>
              <th className="pb-3 font-semibold text-center">Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638]">
            {filteredLinks.map((l) => (
              <tr key={l.id} className="hover:bg-[#111622] transition-colors">
                <td className="py-3.5">
                  <div className="font-semibold text-white">{l.name}</div>
                  <div className="text-[11px] text-emerald-400 font-mono">/go/{l.slug}</div>
                </td>
                <td className="py-3.5">
                  <div className="font-semibold text-gray-200">{l.user.name}</div>
                  <div className="text-[10px] text-gray-400">{l.user.email}</div>
                </td>
                <td className="py-3.5">
                  {l.campaign ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {l.campaign.name} ({l.campaign.model})
                    </span>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="py-3.5 max-w-xs truncate font-mono text-[11px] text-gray-300">
                  <a
                    href={l.destinationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">{l.destinationUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-gray-400" />
                  </a>
                </td>
                <td className="py-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      l.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="py-3.5 text-right font-bold text-white">
                  {formatNumber(l.validClicks)}{' '}
                  <span className="text-[10px] text-gray-400">/ {formatNumber(l.totalClicks)}</span>
                </td>
                <td className="py-3.5 text-right font-bold text-emerald-400">
                  {formatCurrency(l.earnings)}
                </td>
                <td className="py-3.5 text-center">
                  <button
                    onClick={() => handleToggle(l)}
                    disabled={loadingId === l.id}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      l.status === 'ACTIVE'
                        ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                        : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                    title={l.status === 'ACTIVE' ? 'Pause link' : 'Activate link'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
