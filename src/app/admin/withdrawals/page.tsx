import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import AdminWithdrawalsView from './AdminWithdrawalsView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminWithdrawalsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [withdrawals, usersWithPayout] = await Promise.all([
    prisma.withdrawal.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, availableBalance: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: {
        payoutDetails: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        availableBalance: true,
        payoutDetails: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return (
    <AdminShell
      admin={user}
      title="Disbursement Queue & Approvals"
      subtitle="Review pending payout requests, inspect user linked Bank / UPI accounts, and approve disbursements"
    >
      <AdminWithdrawalsView
        initialWithdrawals={withdrawals}
        usersWithPayout={usersWithPayout}
      />
    </AdminShell>
  );
}
