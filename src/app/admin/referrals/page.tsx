import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { Users2, DollarSign, Gift, Percent } from 'lucide-react';

export default async function AdminReferralsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [referrals, commissionsSum, setting] = await Promise.all([
    prisma.referral.findMany({
      include: {
        referrer: { select: { id: true, name: true, email: true, referralCode: true } },
        referredUser: {
          select: { id: true, name: true, email: true, status: true, lifetimeEarnings: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.referralEarning.aggregate({ _sum: { amount: true } }),
    prisma.platformSetting.findUnique({ where: { key: 'REFERRAL_COMMISSION_PERCENT' } }),
  ]);

  const commissionPercent = setting ? parseFloat(setting.value) : 5.0;
  const totalCommissionPaid = commissionsSum._sum.amount || 0;

  return (
    <AdminShell
      admin={user}
      title="Referral Network Oversight"
      subtitle="Audit affiliate relationships, track bonus disbursements, and guard against self-referral abuse"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Active Referral Links"
          value={formatNumber(referrals.length)}
          subtitle="Registered affiliate bonds"
          icon={Users2}
          accent="blue"
        />

        <StatCard
          title="Total Referral Payouts"
          value={formatCurrency(totalCommissionPaid)}
          subtitle="Commissions distributed"
          icon={DollarSign}
          accent="green"
        />

        <StatCard
          title="Commission Percentage"
          value={`${commissionPercent}%`}
          subtitle="Platform incentive cut"
          icon={Percent}
          accent="purple"
        />
      </div>

      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-4">Affiliate Tree Ledger</h3>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#232D3F] text-gray-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 font-semibold">Referrer (Sponsor)</th>
              <th className="pb-3 font-semibold">Referred Publisher</th>
              <th className="pb-3 font-semibold">Registration Date</th>
              <th className="pb-3 font-semibold">Account Status</th>
              <th className="pb-3 font-semibold text-right">Publisher Lifetime Yield</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638]">
            {referrals.map((r) => (
              <tr key={r.id} className="hover:bg-[#111622] transition-colors">
                <td className="py-3.5">
                  <div className="font-semibold text-white">{r.referrer.name}</div>
                  <div className="text-[11px] text-emerald-400 font-mono">Code: {r.referrer.referralCode}</div>
                </td>
                <td className="py-3.5">
                  <div className="font-semibold text-white">{r.referredUser.name}</div>
                  <div className="text-[11px] text-gray-400">{r.referredUser.email}</div>
                </td>
                <td className="py-3.5 text-gray-400 font-mono text-[11px]">
                  {formatDate(r.referredUser.createdAt)}
                </td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {r.referredUser.status}
                  </span>
                </td>
                <td className="py-3.5 text-right font-mono font-bold text-emerald-400">
                  {formatCurrency(r.referredUser.lifetimeEarnings)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
