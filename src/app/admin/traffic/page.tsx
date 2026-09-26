import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminShell from '@/components/layout/AdminShell';
import AdminTrafficView from './AdminTrafficView';

export default async function AdminTrafficPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [clicks, validCount, suspiciousCount, invalidCount] = await Promise.all([
    prisma.clickEvent.findMany({
      include: {
        link: {
          select: {
            name: true,
            slug: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.clickEvent.count({ where: { status: 'VALID' } }),
    prisma.clickEvent.count({ where: { status: 'SUSPICIOUS' } }),
    prisma.clickEvent.count({ where: { status: 'INVALID' } }),
  ]);

  return (
    <AdminShell
      admin={user}
      title="Traffic Quality & Fraud Inspector"
      subtitle="Defensive real-time audit log of click events, bot signatures, rate-limit triggers, and classifications"
    >
      <AdminTrafficView
        initialClicks={clicks}
        counts={{
          valid: validCount,
          suspicious: suspiciousCount,
          invalid: invalidCount,
          total: validCount + suspiciousCount + invalidCount,
        }}
      />
    </AdminShell>
  );
}
