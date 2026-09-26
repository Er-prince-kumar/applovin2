import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import AdminLinksView from './AdminLinksView';

export default async function AdminLinksPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const links = await prisma.link.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      campaign: {
        select: { id: true, name: true, model: true, rate: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminShell
      admin={user}
      title="Global Links Oversight"
      subtitle="Inspect and manage all monetization links created across the network"
    >
      <AdminLinksView initialLinks={links} />
    </AdminShell>
  );
}
