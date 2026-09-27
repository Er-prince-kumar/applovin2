import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardShell from '@/components/layout/DashboardShell';
import SettingsView from './SettingsView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell
      user={user}
      title="Publisher Preferences"
      subtitle="Configure payout presets, notification triggers, and programmatic developer access"
    >
      <SettingsView user={user} />
    </DashboardShell>
  );
}
