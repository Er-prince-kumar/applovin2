import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import WithdrawalsView from './WithdrawalsView';

export default async function WithdrawalsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [withdrawals, setting] = await Promise.all([
    prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.platformSetting.findUnique({
      where: { key: 'MIN_WITHDRAWAL_AMOUNT' },
    }),
  ]);

  const minWithdrawal = setting ? parseFloat(setting.value) : 10.0;

  return (
    <DashboardShell
      user={user}
      title="Withdrawals & Payouts"
      subtitle="Request disbursements of your earned balance and track real-time settlement status"
    >
      <WithdrawalsView
        initialWithdrawals={withdrawals}
        availableBalance={user.availableBalance}
        pendingBalance={user.pendingBalance}
        lifetimeEarnings={user.lifetimeEarnings}
        totalWithdrawn={user.totalWithdrawn}
        minWithdrawal={minWithdrawal}
        initialPayoutMethod={user.payoutDetails ? JSON.parse(user.payoutDetails) : null}
      />
    </DashboardShell>
  );
}
