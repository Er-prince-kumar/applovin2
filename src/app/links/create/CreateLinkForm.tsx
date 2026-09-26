'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Link2,
  Globe,
  Tag,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CampaignItem {
  id: string;
  name: string;
  model: string;
  rate: number;
  category: string;
}

interface CreateLinkFormProps {
  campaigns: CampaignItem[];
}

export default function CreateLinkForm({ campaigns }: CreateLinkFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || '');
  const [customSlug, setCustomSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedCampaign = campaigns.find((c) => c.id === campaignId) || campaigns[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          destinationUrl,
          campaignId: campaignId || undefined,
          slug: customSlug.trim() || undefined,
          description: description.trim() || undefined,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create link');
      }

      setCreatedLink(data.link);
      toast('Smart monetization link created!', 'success');
    } catch (err: any) {
      setError(err.message || 'Error creating link');
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = () => {
    if (!createdLink) return;
    const url = `${window.location.origin}/go/${createdLink.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast('Public link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  if (createdLink) {
    const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/go/${createdLink.slug}`;

    return (
      <div className="bg-[#151B26] border border-emerald-500/40 rounded-2xl p-8 shadow-2xl text-center animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Link Successfully Created!</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
          Your smart link is active and ready to receive genuine traffic. Real-time clicks and earnings will populate instantly.
        </p>

        {/* Public Link Box */}
        <div className="bg-[#0D121C] border border-[#232D3F] rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="overflow-hidden w-full">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Public Tracking URL
            </div>
            <code className="text-emerald-400 font-mono text-sm block truncate select-all">
              {publicUrl}
            </code>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <a
              href={`/go/${createdLink.slug}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-[#151B26] text-gray-300 hover:text-white border border-[#232D3F]"
              title="Test Redirect"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setCreatedLink(null);
              setName('');
              setDestinationUrl('');
              setCustomSlug('');
              setDescription('');
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E2638] hover:bg-[#27334a] text-white text-xs font-semibold transition-colors"
          >
            Create Another Link
          </button>
          <Link
            href="/links"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
          >
            Go to My Links
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 sm:p-8 shadow-xl">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Link Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Link Name / Title *
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Best Developer Tools 2026 Roundup"
              className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">A private title to organize your links.</p>
        </div>

        {/* Destination URL */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Destination URL *
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="url"
              required
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://example.com/target-article"
              className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            The final website where verified human traffic is redirected.
          </p>
        </div>

        {/* Campaign Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Connected Advertising Campaign *
          </label>
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {campaigns.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {camp.name} — [{camp.model}] ($
                {camp.model === 'CPM' ? `${camp.rate} / 1k` : `${camp.rate} / event`})
              </option>
            ))}
          </select>

          {selectedCampaign && (
            <div className="mt-2.5 p-3 rounded-xl bg-[#0D121C] border border-[#1E2638] flex items-center justify-between text-xs">
              <span className="text-gray-400">Campaign Category:</span>
              <span className="font-semibold text-white">{selectedCampaign.category}</span>
              <span className="text-gray-400">Yield Model:</span>
              <span className="font-bold text-emerald-400">
                {selectedCampaign.model} (${selectedCampaign.rate})
              </span>
            </div>
          )}
        </div>

        {/* Custom Slug (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Custom Slug (Optional)
          </label>
          <div className="flex rounded-xl overflow-hidden border border-[#232D3F] focus-within:border-emerald-500">
            <span className="bg-[#1E2638] px-3.5 py-2.5 text-xs text-gray-400 flex items-center shrink-0 border-r border-[#232D3F]">
              /go/
            </span>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="my-custom-keyword"
              className="w-full bg-[#0D121C] px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none font-mono"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Leave blank to automatically generate a unique 7-character slug.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Internal Note / Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="e.g. Traffic source: Bio link on Twitter & Instagram"
            className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Initial Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-200">
              <input
                type="radio"
                name="status"
                value="ACTIVE"
                checked={status === 'ACTIVE'}
                onChange={() => setStatus('ACTIVE')}
                className="text-emerald-500 focus:ring-emerald-500"
              />
              <span>Active (Monetizing Immediately)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-200">
              <input
                type="radio"
                name="status"
                value="PAUSED"
                checked={status === 'PAUSED'}
                onChange={() => setStatus('PAUSED')}
                className="text-emerald-500 focus:ring-emerald-500"
              />
              <span>Paused (Draft)</span>
            </label>
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
              <span>Generate Monetization Link</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
