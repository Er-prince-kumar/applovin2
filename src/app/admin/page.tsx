import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency, formatNumber, formatDate, formatDateTime } from '@/lib/utils';
import {
  Users,
  ShieldCheck,
  MousePointerClick,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Wallet,
  Link2,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Aggregate Platform-wide KPIs
  const [
    totalUsers,
    activeUsers,
    totalClicks,
    validClicks,
    invalidClicks,
    suspiciousClicks,
    earningsSum,
    activeLinksCount,
    pendingWd,
    paidWd,
    recentTraffic,
    pendingWithdrawalsQueue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.clickEvent.count(),
    prisma.clickEvent.count({ where: { status: 'VALID' } }),
    prisma.clickEvent.count({ where: { status: 'INVALID' } }),
    prisma.clickEvent.count({ where: { status: 'SUSPICIOUS' } }),
    prisma.earning.aggregate({ _sum: { amount: true } }),
    prisma.link.count({ where: { status: 'ACTIVE' } }),
    prisma.withdrawal.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.withdrawal.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.clickEvent.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        link: {
          select: { name: true, slug: true, user: { select: { name: true } } },
        },
      },
    }),
    prisma.withdrawal.findMany({
      where: { status: 'PENDING' },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const totalUserEarnings = earningsSum._sum.amount || 0;
  // Estimated gross advertiser turnover (assuming 15% platform margin: totalPublisherEarnings / 0.85)
  const estimatedGrossRevenue = totalUserEarnings / 0.85;

  return (
    <AdminShell
      admin={user}
      title="Platform Operations Center"
      subtitle="Global overview of network activity, publisher payouts, and traffic health"
    >
      {/* Primary Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={formatNumber(totalUsers)}
          subtitle={`${activeUsers} currently active`}
          icon={Users}
          accent="blue"
        />

        <StatCard
          title="Total Clicks"
          value={formatNumber(totalClicks)}
          subtitle={`${formatNumber(validClicks)} valid (${totalClicks > 0 ? ((validClicks / totalClicks) * 100).toFixed(1) : 0}%)`}
          icon={MousePointerClick}
          accent="green"
        />

        <StatCard
          title="Publisher Earnings"
          value={formatCurrency(totalUserEarnings)}
          subtitle={`Gross est: ${formatCurrency(estimatedGrossRevenue)}`}
          icon={TrendingUp}
          accent="green"
        />

        <StatCard
          title="Pending Payouts"
          value={formatCurrency(pendingWd._sum.amount || 0)}
          subtitle={`${pendingWd._count.id} requests awaiting action`}
          icon={Clock}
          accent="amber"
          badge={pendingWd._count.id > 0 ? `${pendingWd._count.id} Action Needed` : undefined}
        />
      </div>

      {/* Traffic Quality Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#151B26] border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Valid Traffic
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber(validClicks)}</div>
          <div className="text-xs text-gray-400 mt-1">Monetized and credited to ledger</div>
        </div>

        <div className="bg-[#151B26] border border-amber-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Suspicious Frequency
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{formatNumber(suspiciousClicks)}</div>
          <div className="text-xs text-gray-400 mt-1">High burst volume; isolated from earnings</div>
        </div>

        <div className="bg-[#151B26] border border-red-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Invalid / Bot Traffic
            </span>
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{formatNumber(invalidClicks)}</div>
          <div className="text-xs text-gray-400 mt-1">Scrapers & headless bots blocked</div>
        </div>
      </div>

      {/* Operations Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Withdrawals Queue */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Pending Withdrawal Approvals</h3>
              <p className="text-xs text-gray-400">Publisher disbursement requests requiring review</p>
            </div>
            <Link
              href="/admin/withdrawals"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Open Queue
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingWithdrawalsQueue.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              All withdrawal requests have been processed!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawalsQueue.map((w) => (
                <div
                  key={w.id}
                  className="p-3.5 rounded-xl bg-[#0D121C] border border-[#1E2638] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{w.user.name}</div>
                    <div className="text-[11px] text-gray-400">
                      {w.paymentMethod} &bull; {w.paymentDetails}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(w.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">
                      {formatCurrency(w.amount)}
                    </div>
                    <Link
                      href="/admin/withdrawals"
                      className="text-[10px] text-emerald-400 hover:underline font-semibold"
                    >
                      Process &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Traffic Inspector Feed */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Recent Traffic Log</h3>
              <p className="text-xs text-gray-400">Real-time inspection of public redirects</p>
            </div>
            <Link
              href="/admin/traffic"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Traffic Inspector
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentTraffic.map((click) => (
              <div
                key={click.id}
                className="p-3 rounded-xl bg-[#0D121C] border border-[#1E2638] flex items-center justify-between text-xs"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{click.link.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        click.status === 'VALID'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : click.status === 'SUSPICIOUS'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {click.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 truncate mt-0.5">
                    {click.device} &bull; {click.browser} &bull; {click.country} &bull; IP: {click.ipAddress}
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 whitespace-nowrap">
                  {formatDateTime(click.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
