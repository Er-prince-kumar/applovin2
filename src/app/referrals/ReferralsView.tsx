'use client';

import React, { useState } from 'react';
import {
  Users2,
  DollarSign,
  TrendingUp,
  Percent,
  Copy,
  Check,
  Share2,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface ReferralsViewProps {
  referralCode: string;
  commissionPercent: number;
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  referrals: any[];
  earningsHistory: any[];
}

export default function ReferralsView({
  referralCode,
  commissionPercent,
  totalReferrals,
  activeReferrals,
  totalEarned,
  referrals,
  earningsHistory,
}: ReferralsViewProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const referralUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/register?ref=${referralCode}`
      : `https://linkearn.com/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Referral Link Hero Box */}
      <div className="bg-gradient-to-r from-[#151B26] to-[#121E24] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Gift className="w-3.5 h-3.5" />
              <span>{commissionPercent}% Lifetime Affiliate Commission</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Share Your Link & Earn Continuously
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              When a creator signs up through your personal invite link, you will receive a permanent{' '}
              {commissionPercent}% bonus on all approved traffic revenue they generate.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <div className="bg-[#0D121C] border border-[#232D3F] rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
              <code className="text-emerald-400 font-mono text-xs select-all truncate max-w-xs">
                {referralUrl}
              </code>
              <button
                onClick={handleCopy}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shrink-0 shadow-md shadow-emerald-500/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Program Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Referred"
          value={totalReferrals}
          subtitle="Publishers joined via code"
          icon={Users2}
          accent="blue"
        />

        <StatCard
          title="Active Publishers"
          value={activeReferrals}
          subtitle="Currently monetizing links"
          icon={ShieldCheck}
          accent="green"
        />

        <StatCard
          title="Commission Cut"
          value={`${commissionPercent}%`}
          subtitle="Fixed platform bonus rate"
          icon={Percent}
          accent="amber"
        />

        <StatCard
          title="Total Referral Revenue"
          value={formatCurrency(totalEarned)}
          subtitle="Lifetime referral dividends"
          icon={DollarSign}
          accent="green"
        />
      </div>

      {/* Referred Users Table */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Referred Publishers Network</h3>

        {referrals.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            No publishers have registered via your referral link yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232D3F] text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Publisher</th>
                  <th className="pb-3 font-semibold">Registration Date</th>
                  <th className="pb-3 font-semibold">Account Status</th>
                  <th className="pb-3 font-semibold text-right">Publisher Lifetime Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-[#111622] transition-colors">
                    <td className="py-3.5 font-semibold text-white">
                      <div>{r.referredUser.name}</div>
                      <div className="text-[11px] text-gray-400 font-normal">
                        {r.referredUser.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                      </div>
                    </td>
                    <td className="py-3.5 text-gray-400 font-mono text-[11px]">
                      {formatDate(r.referredUser.createdAt)}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {r.referredUser.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono text-gray-200 font-bold">
                      {formatCurrency(r.referredUser.lifetimeEarnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Referral Earnings */}
      {earningsHistory.length > 0 && (
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Recent Commission Dividends</h3>
          <div className="space-y-2">
            {earningsHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#0D121C] border border-[#1E2638] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-white">{item.referredUser.name}</span>
                  <span className="text-gray-400 ml-2">
                    ({(item.commissionRate * 100).toFixed(0)}% commission)
                  </span>
                  <div className="text-[10px] text-gray-400">{formatDateTime(item.createdAt)}</div>
                </div>
                <div className="font-bold text-emerald-400 text-sm">
                  +{formatCurrency(item.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
