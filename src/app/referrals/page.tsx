import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import ReferralsView from './ReferralsView';

export default async function ReferralsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // 1. Fetch referred users
  const [referrals, referralEarnings, setting] = await Promise.all([
    prisma.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referredUser: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            status: true,
            lifetimeEarnings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.referralEarning.findMany({
      where: { referrerId: user.id },
      include: {
        referredUser: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
    prisma.platformSetting.findUnique({
      where: { key: 'REFERRAL_COMMISSION_PERCENT' },
    }),
  ]);

  const commissionPercent = setting ? parseFloat(setting.value) : 5.0;
  const totalCommissionEarned = referralEarnings.reduce((acc, curr) => acc + curr.amount, 0);
  const activeReferralsCount = referrals.filter((r) => r.referredUser.status === 'ACTIVE').length;

  return (
    <DashboardShell
      user={user}
      title="Referral Program"
      subtitle="Invite fellow publishers and creators to earn a permanent 5% commission on their verified traffic revenue"
    >
      <ReferralsView
        referralCode={user.referralCode}
        commissionPercent={commissionPercent}
        totalReferrals={referrals.length}
        activeReferrals={activeReferralsCount}
        totalEarned={totalCommissionEarned}
        referrals={referrals}
        earningsHistory={referralEarnings}
      />
    </DashboardShell>
  );
}
