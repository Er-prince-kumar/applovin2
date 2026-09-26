import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency, formatNumber, formatDate, formatDateTime } from '@/lib/utils';
import { DollarSign, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';

export default async function AdminEarningsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [totalEarningsSum, totalPaidOut, totalTransactionsCount, recentTransactions] =
    await Promise.all([
      prisma.earning.aggregate({ _sum: { amount: true } }),
      prisma.withdrawal.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.transaction.count(),
      prisma.transaction.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

  const totalUserEarnings = totalEarningsSum._sum.amount || 0;
  const totalSettled = totalPaidOut._sum.amount || 0;
  const platformMargin = totalUserEarnings * 0.15; // 15% margin

  return (
    <AdminShell
      admin={user}
      title="Global Accounting Ledger"
      subtitle="Complete platform audit trail of publisher credits, withdrawals, and platform margin"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Publisher Credits"
          value={formatCurrency(totalUserEarnings)}
          subtitle="All-time verified earnings"
          icon={TrendingUp}
          accent="green"
        />

        <StatCard
          title="Total Disbursed"
          value={formatCurrency(totalSettled)}
          subtitle="Settled withdrawals"
          icon={Wallet}
          accent="purple"
        />

        <StatCard
          title="Platform Gross Margin"
          value={formatCurrency(platformMargin)}
          subtitle="15% platform commission cut"
          icon={DollarSign}
          accent="blue"
        />
      </div>

      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">System Transactions ({totalTransactionsCount})</h3>
          <span className="text-xs text-gray-400">Showing last 50 events</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#232D3F] text-gray-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 font-semibold">Timestamp</th>
              <th className="pb-3 font-semibold">Publisher</th>
              <th className="pb-3 font-semibold">Type</th>
              <th className="pb-3 font-semibold">Description</th>
              <th className="pb-3 font-semibold text-right">Amount</th>
              <th className="pb-3 font-semibold text-right">Balance After</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638]">
            {recentTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#111622] transition-colors">
                <td className="py-3.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                  {formatDateTime(tx.createdAt)}
                </td>
                <td className="py-3.5">
                  <div className="font-semibold text-white">{tx.user.name}</div>
                  <div className="text-[10px] text-gray-400">{tx.user.email}</div>
                </td>
                <td className="py-3.5">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      tx.type === 'EARNING'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : tx.type === 'WITHDRAWAL'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="py-3.5 text-gray-300 font-medium">{tx.description}</td>
                <td
                  className={`py-3.5 text-right font-bold text-sm ${
                    tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.amount >= 0 ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                </td>
                <td className="py-3.5 text-right font-mono font-semibold text-white">
                  {formatCurrency(tx.balanceAfter)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
