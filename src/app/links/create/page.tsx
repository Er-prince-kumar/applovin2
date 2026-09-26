import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import CreateLinkForm from './CreateLinkForm';

export default async function CreateLinkPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const campaigns = await prisma.campaign.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { rate: 'desc' },
  });

  return (
    <DashboardShell
      user={user}
      title="Create Monetization Link"
      subtitle="Configure your target URL and connect it to high-performing campaigns"
    >
      <div className="max-w-2xl mx-auto">
        <CreateLinkForm campaigns={campaigns} />
      </div>
    </DashboardShell>
  );
}
