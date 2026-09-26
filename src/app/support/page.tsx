import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardShell from '@/components/layout/DashboardShell';
import SupportView from './SupportView';

export default async function SupportPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell
      user={user}
      title="Publisher Support & Guidelines"
      subtitle="Knowledge center, traffic compliance documentation, and dedicated creator assistance"
    >
      <SupportView />
    </DashboardShell>
  );
}
