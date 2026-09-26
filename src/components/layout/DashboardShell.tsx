'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import MobileBottomBar from './MobileBottomBar';
import { ToastProvider } from '@/components/ui/Toast';

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    referralCode: string;
    availableBalance: number;
    pendingBalance: number;
    lifetimeEarnings: number;
    totalWithdrawn: number;
  };
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function DashboardShell({
  user,
  title,
  subtitle,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex">
        {/* Desktop Sidebar */}
        <Sidebar user={user} />

        {/* Mobile Navigation Drawer */}
        <MobileNav
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          user={user}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            title={title}
            subtitle={subtitle}
            referralCode={user.referralCode}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
            {children}
          </main>

          {/* Native Mobile Bottom Tabs */}
          <MobileBottomBar />
        </div>
      </div>
    </ToastProvider>
  );
}
