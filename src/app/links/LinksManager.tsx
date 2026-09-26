'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Link2,
  Plus,
  Search,
  Copy,
  Check,
  ExternalLink,
  Power,
  Trash2,
  DollarSign,
  MousePointerClick,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface LinkItem {
  id: string;
  name: string;
  slug: string;
  destinationUrl: string;
  description: string | null;
  status: string;
  totalClicks: number;
  validClicks: number;
  earnings: number;
  createdAt: string | Date;
  campaign: {
    id: string;
    name: string;
    model: string;
    rate: number;
  } | null;
}

interface LinksManagerProps {
  initialLinks: any[];
  campaigns: any[];
}

export default function LinksManager({ initialLinks }: LinksManagerProps) {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.name.toLowerCase().includes(search.toLowerCase()) ||
      link.slug.toLowerCase().includes(search.toLowerCase()) ||
      link.destinationUrl.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || link.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopy = (link: LinkItem) => {
    const url = `${window.location.origin}/go/${link.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    toast(`Copied ${url}`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleStatus = async (link: LinkItem) => {
    setLoadingId(link.id);
    const nextStatus = link.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, status: nextStatus } : l))
      );
      toast(`Link ${nextStatus === 'ACTIVE' ? 'activated' : 'paused'}`, 'info');
    } catch {
      toast('Failed to change status', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link? Historical click logs will be archived.')) {
      return;
    }

    try {
      const res = await fetch(`/api/links/${linkId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      setLinks((prev) => prev.filter((l) => l.id !== linkId));
      toast('Link removed', 'info');
    } catch {
      toast('Failed to delete link', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#151B26] border border-[#232D3F] rounded-2xl p-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links by name, slug or destination..."
            className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter & CTA Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0D121C] border border-[#232D3F] rounded-xl p-1 text-xs">
            {['ALL', 'ACTIVE', 'PAUSED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <Link
            href="/links/create"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Link</span>
          </Link>
        </div>
      </div>

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Links Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
            {search || statusFilter !== 'ALL'
              ? 'Try changing your search query or status filter.'
              : 'Create your first smart link to start monetizing genuine visitors.'}
          </p>
          <Link
            href="/links/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Smart Link</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLinks.map((link) => {
            const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/go/${link.slug}` : `/go/${link.slug}`;
            const isCopied = copiedId === link.id;

            return (
              <div
                key={link.id}
                className="bg-[#151B26] border border-[#232D3F] hover:border-gray-700 rounded-2xl p-5 transition-all shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Link Info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">{link.name}</h3>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          link.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {link.status}
                      </span>

                      {link.campaign && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {link.campaign.model} (${link.campaign.rate})
                        </span>
                      )}

                      <span className="text-[11px] text-gray-400 ml-auto sm:ml-0">
                        {formatDate(link.createdAt)}
                      </span>
                    </div>

                    {/* URLs row */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 shrink-0">Monetized:</span>
                        <code className="text-emerald-400 bg-[#0D121C] px-2 py-0.5 rounded border border-[#1E2638] font-mono text-[11px] select-all">
                          {publicUrl}
                        </code>
                        <button
                          onClick={() => handleCopy(link)}
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1E2638] transition-colors"
                          title="Copy Link"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={`/go/${link.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-gray-400 hover:text-emerald-400 hover:bg-[#1E2638] transition-colors"
                          title="Test Redirect"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
                        <span className="shrink-0">Destination:</span>
                        <span className="text-gray-300 truncate font-mono text-[11px]">
                          {link.destinationUrl}
                        </span>
                      </div>
                    </div>

                    {link.description && (
                      <p className="text-xs text-gray-400 italic">{link.description}</p>
                    )}
                  </div>

                  {/* Right Metrics & Quick Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#1E2638] shrink-0">
                    <div className="text-left lg:text-right">
                      <div className="text-xs text-gray-400">Yield</div>
                      <div className="text-lg font-extrabold text-emerald-400">
                        {formatCurrency(link.earnings)}
                      </div>
                    </div>

                    <div className="text-left lg:text-right">
                      <div className="text-xs text-gray-400">Clicks</div>
                      <div className="text-sm font-bold text-white">
                        {formatNumber(link.validClicks)}{' '}
                        <span className="text-xs text-gray-400">/ {formatNumber(link.totalClicks)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(link)}
                        disabled={loadingId === link.id}
                        title={link.status === 'ACTIVE' ? 'Pause link' : 'Activate link'}
                        className={`p-2 rounded-xl border transition-colors ${
                          link.status === 'ACTIVE'
                            ? 'bg-[#151C28] border-gray-700 text-gray-300 hover:text-amber-400 hover:border-amber-400/40'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(link.id)}
                        title="Delete link"
                        className="p-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
