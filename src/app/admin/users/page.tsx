import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import AdminUsersView from './AdminUsersView';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      referralCode: true,
      availableBalance: true,
      pendingBalance: true,
      lifetimeEarnings: true,
      totalWithdrawn: true,
      createdAt: true,
      _count: {
        select: {
          links: true,
          referralRecords: true,
          withdrawals: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminShell
      admin={user}
      title="Publisher Directory"
      subtitle="Manage all user accounts, inspect earnings balances, and handle account status"
    >
      <AdminUsersView initialUsers={users} />
    </AdminShell>
  );
}
