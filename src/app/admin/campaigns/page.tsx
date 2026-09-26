import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import AdminCampaignsView from './AdminCampaignsView';

export default async function AdminCampaignsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const campaigns = await prisma.campaign.findMany({
    include: {
      _count: {
        select: { links: true, earnings: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminShell
      admin={user}
      title="Advertising Campaigns & Yield Models"
      subtitle="Configure performance monetization programs, adjust CPM/CPC/CPA rates, and control availability"
    >
      <AdminCampaignsView initialCampaigns={campaigns} />
    </AdminShell>
  );
}
