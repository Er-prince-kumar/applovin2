'use client';

import React, { useState } from 'react';
import { Megaphone, Plus, Power, DollarSign, Edit, Check, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function AdminCampaignsView({ initialCampaigns }: { initialCampaigns: any[] }) {
  const [campaigns, setCampaigns] = useState<any[]>(initialCampaigns);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [model, setModel] = useState<'CPC' | 'CPM' | 'CPA'>('CPC');
  const [rate, setRate] = useState('0.08');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const openCreateModal = () => {
    setEditingCampaign(null);
    setName('');
    setModel('CPC');
    setRate('0.08');
    setCategory('General');
    setDescription('');
    setStatus('ACTIVE');
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (camp: any) => {
    setEditingCampaign(camp);
    setName(camp.name);
    setModel(camp.model);
    setRate(camp.rate.toString());
    setCategory(camp.category);
    setDescription(camp.description || '');
    setStatus(camp.status);
    setError(null);
    setShowModal(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name,
        model,
        rate: parseFloat(rate),
        category,
        description: description.trim() || undefined,
        status,
      };

      if (editingCampaign) {
        const res = await fetch('/api/admin/campaigns', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCampaign.id, ...payload }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update campaign');

        setCampaigns((prev) =>
          prev.map((c) => (c.id === editingCampaign.id ? { ...c, ...data.campaign } : c))
        );
        toast(`Campaign "${name}" updated`, 'success');
      } else {
        const res = await fetch('/api/admin/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create campaign');

        setCampaigns((prev) => [data.campaign, ...prev]);
        toast(`Campaign "${name}" launched`, 'success');
      }

      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(camp: any) {
    const nextStatus = camp.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: camp.id, status: nextStatus }),
      });
      if (!res.ok) throw new Error('Status change failed');

      setCampaigns((prev) =>
        prev.map((c) => (c.id === camp.id ? { ...c, status: nextStatus } : c))
      );
      toast(`Campaign set to ${nextStatus}`, 'info');
    } catch {
      toast('Failed to change campaign status', 'error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-[#151B26] border border-[#232D3F] rounded-2xl p-4 shadow-lg">
        <div>
          <h3 className="text-base font-bold text-white">Active Ad Networks ({campaigns.length})</h3>
          <p className="text-xs text-gray-400">
            Publishers bind their smart links to these yield programs
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-[#151B26] border border-[#232D3F] hover:border-gray-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {camp.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    camp.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {camp.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-white mb-1">{camp.name}</h4>
              <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                {camp.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 border-t border-[#1E2638] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Yield Model:</span>
                <span className="font-bold text-white">{camp.model}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Publisher Payout Rate:</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  ${camp.rate} {camp.model === 'CPM' ? '/ 1k imps' : '/ event'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Active Links:</span>
                <span className="font-bold text-gray-200">{camp._count?.links ?? 0}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => openEditModal(camp)}
                  className="flex-1 py-1.5 rounded-lg bg-[#0D121C] border border-[#232D3F] text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Rate</span>
                </button>

                <button
                  onClick={() => handleToggleStatus(camp)}
                  title={camp.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    camp.status === 'ACTIVE'
                      ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                      : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-lg bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingCampaign ? 'Edit Advertising Campaign' : 'Create Advertising Campaign'}
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Set revenue rates and availability for publisher monetization links.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Global Tech & Developer Deals"
                  className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Model *
                  </label>
                  <select
                    value={model}
                    onChange={(e: any) => setModel(e.target.value)}
                    className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="CPC">CPC (Cost Per Click)</option>
                    <option value="CPM">CPM (Per 1,000 Impressions)</option>
                    <option value="CPA">CPA (Cost Per Action)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Payout Rate ($) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="0.08"
                    className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Software, Gaming, Finance"
                    className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Target audience, advertisers, notes..."
                  className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E2638] text-xs font-semibold text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
