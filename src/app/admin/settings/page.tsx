import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import AdminSettingsView from './AdminSettingsView';

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const rawSettings = await prisma.platformSetting.findMany({
    orderBy: { key: 'asc' },
  });

  const settingsMap: Record<string, string> = {};
  rawSettings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <AdminShell
      admin={user}
      title="Platform Governance & Rules"
      subtitle="Configure minimum withdrawal limits, referral commission cuts, platform fees, and defensive fraud thresholds"
    >
      <AdminSettingsView initialSettings={settingsMap} />
    </AdminShell>
  );
}
