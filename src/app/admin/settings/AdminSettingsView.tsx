'use client';

import React, { useState } from 'react';
import { Sliders, Save, ShieldAlert, DollarSign, Percent, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsView({
  initialSettings,
}: {
  initialSettings: Record<string, string>;
}) {
  const [settings, setSettings] = useState<Record<string, string>>({
    MIN_WITHDRAWAL_AMOUNT: initialSettings.MIN_WITHDRAWAL_AMOUNT || '10.00',
    REFERRAL_COMMISSION_PERCENT: initialSettings.REFERRAL_COMMISSION_PERCENT || '5.0',
    DEFAULT_CURRENCY: initialSettings.DEFAULT_CURRENCY || 'USD',
    PLATFORM_FEE_PERCENT: initialSettings.PLATFORM_FEE_PERCENT || '15.0',
    FRAUD_MAX_CLICKS_PER_MINUTE: initialSettings.FRAUD_MAX_CLICKS_PER_MINUTE || '6',
    FRAUD_MIN_INTERVAL_SECONDS: initialSettings.FRAUD_MIN_INTERVAL_SECONDS || '3',
  });

  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      toast('Platform parameters saved & enforced immediately', 'success');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-4xl space-y-6">
      {/* Financial & Payout Parameters */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Financial & Payout Thresholds</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Minimum Withdrawal ($)
            </label>
            <input
              type="number"
              step="1.00"
              required
              value={settings.MIN_WITHDRAWAL_AMOUNT}
              onChange={(e) => handleChange('MIN_WITHDRAWAL_AMOUNT', e.target.value)}
              className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Minimum available balance required before publishers can submit payout requests.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Default Settlement Currency
            </label>
            <select
              value={settings.DEFAULT_CURRENCY}
              onChange={(e) => handleChange('DEFAULT_CURRENCY', e.target.value)}
              className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="USD">USD ($ United States Dollar)</option>
              <option value="EUR">EUR (€ Euro)</option>
              <option value="GBP">GBP (£ British Pound)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Referral Bonus Percentage (%)
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={settings.REFERRAL_COMMISSION_PERCENT}
              onChange={(e) => handleChange('REFERRAL_COMMISSION_PERCENT', e.target.value)}
              className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Platform incentive bonus awarded to sponsors for verified referred traffic.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Platform Revenue Margin (%)
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={settings.PLATFORM_FEE_PERCENT}
              onChange={(e) => handleChange('PLATFORM_FEE_PERCENT', e.target.value)}
              className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Gross platform spread retained between advertiser contracts and publisher credits.
            </p>
          </div>
        </div>
      </div>

      {/* Defensive Fraud & Traffic Engine Thresholds */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Traffic Engine & Fraud Defense Thresholds</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Max Clicks Per Minute (Single Fingerprint)
            </label>
            <input
              type="number"
              step="1"
              required
              value={settings.FRAUD_MAX_CLICKS_PER_MINUTE}
              onChange={(e) => handleChange('FRAUD_MAX_CLICKS_PER_MINUTE', e.target.value)}
              className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Exceeding this volume marks subsequent events as SUSPICIOUS and withholds payouts.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Sub-Second Burst Interval Limit (Seconds)
            </label>
            <input
              type="number"
              step="1"
              required
              value={settings.FRAUD_MIN_INTERVAL_SECONDS}
              onChange={(e) => handleChange('FRAUD_MIN_INTERVAL_SECONDS', e.target.value)}
              className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Clicks arriving faster than this interval from an identical hash are marked INVALID.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{saving ? 'Saving...' : 'Save Configuration Changes'}</span>
      </button>
    </form>
  );
}
