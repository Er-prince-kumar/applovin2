import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Receipt,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EarningsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // 1. Fetch user's earnings grouped by type
  const earningsByType = await prisma.earning.groupBy({
    by: ['type'],
    where: { userId: user.id },
    _sum: { amount: true },
    _count: { id: true },
  });

  const modelBreakdown: Record<string, { total: number; count: number }> = {
    CPC: { total: 0, count: 0 },
    CPM: { total: 0, count: 0 },
    CPA: { total: 0, count: 0 },
    REFERRAL_BONUS: { total: 0, count: 0 },
  };

  earningsByType.forEach((group) => {
    if (modelBreakdown[group.type]) {
      modelBreakdown[group.type] = {
        total: group._sum.amount || 0,
        count: group._count.id || 0,
      };
    }
  });

  // 2. Fetch full immutable transaction ledger
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <DashboardShell
      user={user}
      title="Earnings & Immutable Ledger"
      subtitle="Complete accounting ledger of verified traffic payouts and balance adjustments"
    >
      {/* Balances Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Available Balance"
          value={formatCurrency(user.availableBalance)}
          subtitle="Ready for instant withdrawal"
          icon={Wallet}
          accent="green"
        />

        <StatCard
          title="Pending Payouts"
          value={formatCurrency(user.pendingBalance)}
          subtitle="Awaiting admin settlement"
          icon={Receipt}
          accent="amber"
        />

        <StatCard
          title="Lifetime Earnings"
          value={formatCurrency(user.lifetimeEarnings)}
          subtitle="Gross accumulated yield"
          icon={TrendingUp}
          accent="blue"
        />

        <StatCard
          title="Total Paid Out"
          value={formatCurrency(user.totalWithdrawn)}
          subtitle="Successfully disbursed"
          icon={DollarSign}
          accent="purple"
        />
      </div>

      {/* Model Breakdown Cards */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 mb-8 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Earnings Breakdown by Model</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Cost Per Click (CPC)
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {formatCurrency(modelBreakdown.CPC.total)}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {modelBreakdown.CPC.count} verified events
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Impressions (CPM)
            </div>
            <div className="text-xl font-bold text-blue-400 mt-1">
              {formatCurrency(modelBreakdown.CPM.total)}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {modelBreakdown.CPM.count} batches
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Conversions (CPA)
            </div>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {formatCurrency(modelBreakdown.CPA.total)}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {modelBreakdown.CPA.count} approved actions
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Referral Commissions
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {formatCurrency(modelBreakdown.REFERRAL_BONUS.total)}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {modelBreakdown.REFERRAL_BONUS.count} bonus credits
            </div>
          </div>
        </div>
      </div>

      {/* Immutable Ledger Table */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Immutable Transaction Ledger</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Server-Side
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Each entry is cryptographically recorded upon verification
            </p>
          </div>

          <Link
            href="/withdrawals"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shrink-0"
          >
            Request Withdrawal
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No transaction records found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232D3F] text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#111622] transition-colors">
                    <td className="py-3.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          tx.type === 'EARNING'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.type === 'WITHDRAWAL'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : tx.type === 'REFERRAL_BONUS'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-200 font-medium">{tx.description}</td>
                    <td
                      className={`py-3.5 text-right font-bold text-sm ${
                        tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.amount >= 0 ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3.5 text-right font-mono text-gray-300 font-semibold">
                      {formatCurrency(tx.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
