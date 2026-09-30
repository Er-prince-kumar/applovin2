import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import StatCard from '@/components/ui/StatCard';
import EarningsChart from '@/components/charts/EarningsChart';
import TrafficChart from '@/components/charts/TrafficChart';
import { formatCurrency, formatNumber, formatDate, formatDateTime } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Users,
  Percent,
  Link2,
  Users2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Plus,
  Play,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Fetch user's links
  const userLinks = await prisma.link.findMany({
    where: { userId: user.id },
    include: { campaign: true },
    orderBy: { earnings: 'desc' },
  });

  const linkIds = userLinks.map((l) => l.id);

  // 2. Aggregate Today's & Month's Earnings
  const [todayEarningsResult, monthEarningsResult, referralEarningsResult] = await Promise.all([
    prisma.earning.aggregate({
      where: { userId: user.id, createdAt: { gte: startOfToday } },
      _sum: { amount: true },
    }),
    prisma.earning.aggregate({
      where: { userId: user.id, createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.referralEarning.aggregate({
      where: { referrerId: user.id },
      _sum: { amount: true },
    }),
  ]);

  const todayEarnings = todayEarningsResult._sum.amount || 0;
  const monthEarnings = monthEarningsResult._sum.amount || 0;
  const referralEarnings = referralEarningsResult._sum.amount || 0;

  // 3. Traffic & Clicks
  const [clicksCount, validClicksCount, conversionsCount] = await Promise.all([
    prisma.clickEvent.count({ where: { linkId: { in: linkIds } } }),
    prisma.clickEvent.count({ where: { linkId: { in: linkIds }, status: 'VALID' } }),
    prisma.conversion.count({ where: { linkId: { in: linkIds }, status: 'APPROVED' } }),
  ]);

  const uniqueVisitorsRaw = await prisma.clickEvent.findMany({
    where: { linkId: { in: linkIds } },
    select: { visitorHash: true },
    distinct: ['visitorHash'],
  });
  const uniqueVisitors = uniqueVisitorsRaw.length;

  const conversionRate = validClicksCount > 0 ? (conversionsCount / validClicksCount) * 100 : 0;
  const activeLinksCount = userLinks.filter((l) => l.status === 'ACTIVE').length;

  // 4. Time series for charts (Last 7 Days)
  const [pastClicks, pastEarnings] = await Promise.all([
    prisma.clickEvent.findMany({
      where: { linkId: { in: linkIds }, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, visitorHash: true },
    }),
    prisma.earning.findMany({
      where: { userId: user.id, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, amount: true },
    }),
  ]);

  // Aggregate past 7 days into daily chart data
  const chartDays: Record<string, { date: string; earnings: number; clicks: number; visitors: Set<string> }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    chartDays[key] = { date: key, earnings: 0, clicks: 0, visitors: new Set() };
  }

  pastClicks.forEach((c) => {
    const key = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (chartDays[key]) {
      chartDays[key].clicks += 1;
      chartDays[key].visitors.add(c.visitorHash);
    }
  });

  pastEarnings.forEach((e) => {
    const key = new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (chartDays[key]) {
      chartDays[key].earnings += e.amount;
    }
  });

  const chartData = Object.values(chartDays).map((item) => ({
    date: item.date,
    earnings: Number(item.earnings.toFixed(2)),
    clicks: item.clicks,
    visitors: item.visitors.size,
  }));

  // 5. Recent Transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const topLinks = userLinks.slice(0, 4);

  return (
    <DashboardShell
      user={user}
      title="Performance Dashboard"
      subtitle="Real-time monetization metrics and live traffic overview"
    >
      {/* Rewarded Ad Tasks & Auto-Impression Hub Promotion */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-purple-950/60 border border-blue-500/30 p-5 mb-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Ad Tasks & Auto-Impression Engine</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Watch Rewarded Ads & Earn Instant Cash
            </h2>
            <p className="text-gray-300 text-xs max-w-xl">
              Earn $0.05 per video ad, $0.02 per interstitial, plus Auto-Impression streamer and Lucky Spin Wheel rewards powered by Adsterra Smartlinks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/tasks"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25"
            >
              <Play className="w-3.5 h-3.5 fill-gray-950" />
              <span>Ad Task Hub</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Today's Earnings"
          value={formatCurrency(todayEarnings)}
          subtitle="Earned past 24 hours"
          change="+14.2%"
          isPositive={true}
          icon={DollarSign}
          accent="green"
        />

        <StatCard
          title="Total Earnings"
          value={formatCurrency(user.lifetimeEarnings)}
          subtitle={`Available: ${formatCurrency(user.availableBalance)}`}
          icon={TrendingUp}
          accent="green"
        />

        <StatCard
          title="Total Clicks"
          value={formatNumber(clicksCount)}
          subtitle={`${formatNumber(validClicksCount)} verified valid clicks`}
          icon={MousePointerClick}
          accent="blue"
        />

        <StatCard
          title="Unique Visitors"
          value={formatNumber(uniqueVisitors)}
          subtitle={`CTR: ${(validClicksCount > 0 ? (validClicksCount / Math.max(1, uniqueVisitors)) * 100 : 100).toFixed(1)}%`}
          icon={Users}
          accent="purple"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            This Month
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {formatCurrency(monthEarnings)}
          </div>
        </div>

        <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Active Links
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {activeLinksCount} / {userLinks.length}
          </div>
        </div>

        <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Conversion Rate
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {conversionRate.toFixed(2)}%
          </div>
        </div>

        <div className="bg-[#151B26] border border-[#232D3F] rounded-xl p-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Referral Earnings
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {formatCurrency(referralEarnings)}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Earnings Chart */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Earnings Trend</h3>
              <p className="text-xs text-gray-400">Daily accrued revenue (last 7 days)</p>
            </div>
            <Link
              href="/earnings"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Ledger
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <EarningsChart data={chartData} />
        </div>

        {/* Traffic Chart */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Traffic Volume</h3>
              <p className="text-xs text-gray-400">Total clicks vs unique visitors</p>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Full Analytics
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <TrafficChart data={chartData} />
        </div>
      </div>

      {/* Top Performing Links & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Links (2 cols) */}
        <div className="lg:col-span-2 bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Top Performing Links</h3>
              <p className="text-xs text-gray-400">Monetization links generating highest yield</p>
            </div>
            <Link
              href="/links"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View All Links
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topLinks.length === 0 ? (
            <div className="text-center py-10">
              <Link2 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No monetization links created yet.</p>
              <Link
                href="/links/create"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-gray-950 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Link
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-3.5 rounded-xl bg-[#0D121C] border border-[#1E2638] flex items-center justify-between gap-4 hover:border-gray-700 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white truncate">{link.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          link.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {link.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2 truncate">
                      <span className="text-emerald-400 font-mono">/go/{link.slug}</span>
                      <span>&bull;</span>
                      <span className="truncate">{link.destinationUrl}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-emerald-400">
                      {formatCurrency(link.earnings)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatNumber(link.validClicks)} clicks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions (1 col) */}
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white">Recent Ledger</h3>
                <p className="text-xs text-gray-400">Latest immutable entries</p>
              </div>
              <Link
                href="/earnings"
                className="text-xs font-semibold text-gray-400 hover:text-white"
              >
                All
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                No ledger transactions recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-[#0D121C] border border-[#1E2638] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-gray-200">{tx.description}</div>
                      <div className="text-[10px] text-gray-400">{formatDate(tx.createdAt)}</div>
                    </div>
                    <div
                      className={`font-bold text-sm ${
                        tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.amount >= 0 ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#1E2638]">
            <Link
              href="/withdrawals"
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E2638] hover:bg-[#28334b] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Manage Withdrawals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
