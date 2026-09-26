'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, CreditCard, Key, Shield, Check, Copy, Building2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function SettingsView({ user }: { user: any }) {
  const { toast } = useToast();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [payoutAlerts, setPayoutAlerts] = useState(true);
  const [fraudAlerts, setFraudAlerts] = useState(true);
  const [apiKey, setApiKey] = useState('le_live_948f2a1b9c3e80d4e5f6');
  const [copiedKey, setCopiedKey] = useState(false);

  function handleSavePreferences() {
    toast('Preferences saved successfully!', 'success');
  }

  function handleGenerateKey() {
    const newKey = 'le_live_' + Math.random().toString(36).substring(2, 18);
    setApiKey(newKey);
    toast('Generated new API Key', 'info');
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    toast('API key copied', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Notification Preferences */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Notification Triggers</h3>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Control which events send instant alerts to your email.
        </p>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D121C] border border-[#1E2638] cursor-pointer hover:border-gray-700 transition-colors">
            <div>
              <div className="text-xs font-semibold text-white">Daily Traffic & Earnings Digest</div>
              <div className="text-[11px] text-gray-400">
                Receive an email summary of your clicks and accrued yield at midnight UTC.
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-gray-900 border-gray-700 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D121C] border border-[#1E2638] cursor-pointer hover:border-gray-700 transition-colors">
            <div>
              <div className="text-xs font-semibold text-white">Disbursement Status Notifications</div>
              <div className="text-[11px] text-gray-400">
                Get notified as soon as a payout is approved, processed, or transferred.
              </div>
            </div>
            <input
              type="checkbox"
              checked={payoutAlerts}
              onChange={(e) => setPayoutAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-gray-900 border-gray-700 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D121C] border border-[#1E2638] cursor-pointer hover:border-gray-700 transition-colors">
            <div>
              <div className="text-xs font-semibold text-white">Traffic Health & Fraud Warnings</div>
              <div className="text-[11px] text-gray-400">
                Receive high-priority warnings if a link detects automated bot spikes or abnormal patterns.
              </div>
            </div>
            <input
              type="checkbox"
              checked={fraudAlerts}
              onChange={(e) => setFraudAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-gray-900 border-gray-700 focus:ring-emerald-500"
            />
          </label>
        </div>

        <button
          onClick={handleSavePreferences}
          className="mt-6 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20"
        >
          Save Notification Preferences
        </button>
      </div>

      {/* Bank Account & Payout Setup */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Bank Account & Payout Setup</h3>
          </div>
          <Link
            href="/withdrawals"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Manage Bank Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-xs text-gray-400">
          Link your primary bank account (A/C No, Bank Name, IFSC code), UPI ID, or Mobile Wallets for fast automatic withdrawals.
        </p>
      </div>

      {/* Programmatic API Access */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Developer API Key</h3>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Generate programmatic links, retrieve real-time click analytics, and check balance via REST API.
        </p>

        <div className="bg-[#0D121C] border border-[#1E2638] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <code className="text-emerald-400 font-mono text-xs select-all truncate w-full sm:w-auto">
            {apiKey}
          </code>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyKey}
              className="px-3 py-1.5 rounded-lg bg-[#151B26] border border-[#232D3F] text-xs text-gray-300 hover:text-white flex items-center gap-1.5"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleGenerateKey}
              className="px-3 py-1.5 rounded-lg bg-[#1E2638] text-xs text-white hover:bg-[#28354c]"
            >
              Regenerate
            </button>
          </div>
        </div>

        <div className="text-[11px] text-gray-400">
          Authorization header: <code className="text-gray-300 bg-[#0D121C] px-1.5 py-0.5 rounded">Authorization: Bearer {apiKey}</code>
        </div>
      </div>
    </div>
  );
}
