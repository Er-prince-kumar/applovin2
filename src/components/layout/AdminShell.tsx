'use client';

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { ToastProvider } from '@/components/ui/Toast';
import AppInstallModal from '@/components/pwa/AppInstallModal';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import Link from 'next/link';

interface AdminShellProps {
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AdminShell({
  admin,
  title,
  subtitle,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <AppInstallModal />
      <div className="min-h-screen bg-[#080B11] text-gray-100 flex">
        {/* Desktop Sidebar */}
        <AdminSidebar admin={admin} />

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 bg-[#0a0d14] border-r border-[#1a2233] p-4 flex flex-col h-full z-10">
              <div className="flex items-center justify-between pb-4 border-b border-[#1a2233]">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 py-4 space-y-2 text-sm">
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block p-2 rounded-lg text-gray-300 hover:bg-[#131924]"
                >
                  Admin Overview
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setMobileOpen(false)}
                  className="block p-2 rounded-lg text-gray-300 hover:bg-[#131924]"
                >
                  Users
                </Link>
                <Link
                  href="/admin/links"
                  onClick={() => setMobileOpen(false)}
                  className="block p-2 rounded-lg text-gray-300 hover:bg-[#131924]"
                >
                  Links
                </Link>
                <Link
                  href="/admin/traffic"
                  onClick={() => setMobileOpen(false)}
                  className="block p-2 rounded-lg text-gray-300 hover:bg-[#131924]"
                >
                  Traffic Inspector
                </Link>
                <Link
                  href="/admin/withdrawals"
                  onClick={() => setMobileOpen(false)}
                  className="block p-2 rounded-lg text-gray-300 hover:bg-[#131924]"
                >
                  Withdrawals Queue
                </Link>
                <Link
                  href="/admin/campaigns"
                  onClick={() => setMobileOpen(false)}
                  className="block p-2 rounded-lg text-gray-300 hover:bg-[#131924]"
                >
                  Campaigns
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setMobileOpen(false)}
                  className="block p-2 rounded-lg text-gray-300 hover:bg-[#131924]"
                >
                  Platform Settings
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block p-2 rounded-lg text-emerald-400 bg-emerald-500/10 mt-4"
                >
                  Exit to Publisher View
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="md:hidden flex items-center justify-between p-4 bg-[#0a0d14] border-b border-[#1a2233]">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg bg-[#141b27] text-gray-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-purple-300">LinkEarn Admin</span>
          </div>

          <AdminTopbar title={title} subtitle={subtitle} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
