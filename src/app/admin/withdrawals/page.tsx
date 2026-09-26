import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import AdminWithdrawalsView from './AdminWithdrawalsView';

export default async function AdminWithdrawalsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const withdrawals = await prisma.withdrawal.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, availableBalance: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminShell
      admin={user}
      title="Disbursement Queue & Approvals"
      subtitle="Review pending payout requests, approve or reject disbursements, and verify transaction hashes"
    >
      <AdminWithdrawalsView initialWithdrawals={withdrawals} />
    </AdminShell>
  );
}
