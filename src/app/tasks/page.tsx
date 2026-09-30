import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import AdTaskCenter from './AdTaskCenter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Ad Tasks & Earning Hub | LinkEarn',
  description: 'Earn real cash by watching Rewarded Video Ads, Interstitials, Spin & Win, and Auto-Impression Streamer powered by Adsterra Smartlinks.',
};

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayTasksCount = await prisma.transaction.count({
    where: {
      userId: user.id,
      type: 'EARNING',
      description: { contains: 'Reward for watching' },
      createdAt: { gte: startOfToday },
    },
  });

  return (
    <DashboardShell
      user={user}
      title="Ad Tasks & Rewards"
      subtitle="Watch Rewarded Videos, Interstitials & Auto-Impressions to earn instant cash"
    >
      <div className="space-y-6">
        <AdTaskCenter
          initialUser={{
            id: user.id,
            name: user.name,
            availableBalance: user.availableBalance,
            lifetimeEarnings: user.lifetimeEarnings,
          }}
          initialAdsWatchedToday={todayTasksCount}
        />
      </div>
    </DashboardShell>
  );
}
