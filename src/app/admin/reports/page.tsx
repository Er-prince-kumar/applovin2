import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import AdminReportsView from './AdminReportsView';

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [earningsAggregate, paidAggregate, pendingAggregate, clicksAggregate, usersCount] =
    await Promise.all([
      prisma.earning.aggregate({ _sum: { amount: true }, _count: { id: true } }),
      prisma.withdrawal.aggregate({ where: { status: 'PAID' }, _sum: { amount: true }, _count: { id: true } }),
      prisma.withdrawal.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: { id: true } }),
      prisma.clickEvent.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.user.count(),
    ]);

  const totalEarnings = earningsAggregate._sum.amount || 0;
  const totalPaid = paidAggregate._sum.amount || 0;
  const totalPending = pendingAggregate._sum.amount || 0;

  const clickBreakdown: Record<string, number> = { VALID: 0, SUSPICIOUS: 0, INVALID: 0 };
  clicksAggregate.forEach((g) => {
    clickBreakdown[g.status] = g._count.id;
  });

  return (
    <AdminShell
      admin={user}
      title="Financial & Traffic Audit Reports"
      subtitle="Comprehensive revenue statements, traffic audit summaries, and financial reports"
    >
      <AdminReportsView
        totalEarnings={totalEarnings}
        totalPaid={totalPaid}
        totalPending={totalPending}
        clickBreakdown={clickBreakdown}
        usersCount={usersCount}
      />
    </AdminShell>
  );
}
