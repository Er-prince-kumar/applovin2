import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardShell from '@/components/layout/DashboardShell';
import ProfileView from './ProfileView';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell
      user={user}
      title="Account Profile"
      subtitle="Manage your publisher account credentials and profile information"
    >
      <ProfileView user={user} />
    </DashboardShell>
  );
}
