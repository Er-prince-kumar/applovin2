import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import LinksManager from './LinksManager';

export default async function LinksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [links, campaigns] = await Promise.all([
    prisma.link.findMany({
      where: { userId: user.id },
      include: {
        campaign: {
          select: { id: true, name: true, model: true, rate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, model: true, rate: true },
    }),
  ]);

  return (
    <DashboardShell
      user={user}
      title="Monetization Links"
      subtitle="Manage your smart links, view performance, and copy public tracking URLs"
    >
      <LinksManager initialLinks={links} campaigns={campaigns} />
    </DashboardShell>
  );
}
