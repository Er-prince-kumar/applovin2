import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardShell from '@/components/layout/DashboardShell';
import AdTaskCenter from './AdTaskCenter';

export const metadata = {
  title: 'Ad Tasks & Earning Hub | MonetizeMax',
  description: 'Earn real cash by watching Rewarded Video Ads, Interstitials, Spin & Win, and Auto-Impression Streamer powered by AppLovin MAX & Unity Ads.',
};

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

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
        />
      </div>
    </DashboardShell>
  );
}
