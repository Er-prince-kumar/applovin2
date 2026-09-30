'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import {
  LayoutDashboard,
  Link2,
  PlusCircle,
  BarChart3,
  DollarSign,
  Wallet,
  Users2,
  User,
  Settings,
  HelpCircle,
  LogOut,
  X,
  ShieldCheck,
  Play,
  Cpu,
  Smartphone,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    role: string;
    availableBalance: number;
    pendingBalance: number;
  };
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Ad Tasks & Rewards', icon: Play, adHighlight: true },
  { href: '/links', label: 'My Links', icon: Link2 },
  { href: '/links/create', label: 'Create Link', icon: PlusCircle, highlight: true },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/earnings', label: 'Earnings & Ledger', icon: DollarSign },
  { href: '/withdrawals', label: 'Withdrawals', icon: Wallet },
  { href: '/referrals', label: 'Referrals', icon: Users2 },
  { href: '/download', label: 'Mobile App', icon: Smartphone },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/support', label: 'Support & FAQ', icon: HelpCircle },
];

export default function MobileNav({ isOpen, onClose, user }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[85vw] bg-[#0d121c] border-r border-[#1e2638] flex flex-col h-full z-10 shadow-2xl">
        <div className="p-4 border-b border-[#1e2638] flex items-center justify-between">
          <Logo size="sm" showTagline={false} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a2233]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Balance */}
        <div className="m-3 p-3 rounded-xl bg-[#141b27] border border-[#222c40]">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Available Balance
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {formatCurrency(user.availableBalance)}
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href) && item.href !== '/links/create');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  item.adHighlight
                    ? 'bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent text-blue-300 border border-blue-500/30'
                    : item.highlight
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#151b26]'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.adHighlight ? 'text-blue-400 fill-blue-400/30' : isActive || item.highlight ? 'text-emerald-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {item.adHighlight && (
                  <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase tracking-wider">
                    Earn $
                  </span>
                )}
              </Link>
            );
          })}

          {user.role === 'ADMIN' && (
            <div className="pt-2 border-t border-[#1e2638]">
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Center</span>
              </Link>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-[#1e2638]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
