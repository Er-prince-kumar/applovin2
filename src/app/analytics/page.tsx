import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import AnalyticsView from './AnalyticsView';

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const userLinks = await prisma.link.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, slug: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell
      user={user}
      title="Traffic & Earnings Analytics"
      subtitle="Deep dive into your traffic quality, audience geography, devices, and conversion performance"
    >
      <AnalyticsView links={userLinks} />
    </DashboardShell>
  );
}
