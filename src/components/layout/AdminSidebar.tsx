'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import {
  ShieldAlert,
  Users,
  Link2,
  Activity,
  DollarSign,
  Wallet,
  Megaphone,
  Share2,
  Sliders,
  FileSpreadsheet,
  ArrowLeft,
  LogOut,
  Layers,
} from 'lucide-react';

interface AdminSidebarProps {
  admin: {
    name: string;
    email: string;
  };
}

const adminNavItems = [
  { href: '/admin', label: 'Admin Overview', icon: Layers },
  { href: '/admin/users', label: 'User Directory', icon: Users },
  { href: '/admin/links', label: 'Publisher Links', icon: Link2 },
  { href: '/admin/traffic', label: 'Traffic Inspector', icon: Activity, alert: true },
  { href: '/admin/earnings', label: 'Global Ledger', icon: DollarSign },
  { href: '/admin/withdrawals', label: 'Withdrawal Queue', icon: Wallet },
  { href: '/admin/campaigns', label: 'Campaigns & Rates', icon: Megaphone },
  { href: '/admin/referrals', label: 'Referrals Network', icon: Share2 },
  { href: '/admin/settings', label: 'Platform Settings', icon: Sliders },
  { href: '/admin/reports', label: 'Financial Reports', icon: FileSpreadsheet },
];

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <aside className="w-64 bg-[#0a0d14] border-r border-[#1a2233] flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 hidden md:flex">
      {/* Brand & Admin Badge */}
      <div className="p-5 border-b border-[#1a2233]">
        <Logo size="md" showTagline={false} />
        <div className="mt-2.5 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Control Center
          </span>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            Live
          </span>
        </div>
      </div>

      {/* Switch to Publisher View */}
      <div className="mx-4 my-3">
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#141b27] border border-[#232f48] text-xs font-semibold text-gray-300 hover:text-white hover:border-emerald-500/40 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Publisher View</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#131924]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.alert && (
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-4 border-t border-[#1a2233] bg-[#080b11]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold flex items-center justify-center text-xs shrink-0">
              AD
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{admin.name}</div>
              <div className="text-[11px] text-gray-400 truncate">{admin.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
