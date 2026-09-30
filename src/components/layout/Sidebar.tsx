'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Smartphone,
  Download,
  Play,
  Cpu,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SidebarProps {
  user: {
    id?: string;
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

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [balance, setBalance] = useState(user.availableBalance);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const idKey = user.id ? `linkearn_balance_${user.id}` : null;
        const stored = (idKey && localStorage.getItem(idKey)) || localStorage.getItem(`linkearn_balance_${user.email}`);
        if (stored) {
          const num = parseFloat(stored);
          if (!isNaN(num) && num > balance) {
            setBalance(num);
          }
        }
      } catch {}
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.balance === 'number') {
        if (!user.id || !customEvent.detail.userId || customEvent.detail.userId === user.id) {
          setBalance(customEvent.detail.balance);
        }
      }
    };

    window.addEventListener('linkearn_balance_update', handleUpdate);
    return () => {
      window.removeEventListener('linkearn_balance_update', handleUpdate);
    };
  }, [user.id, user.email, balance]);

  useEffect(() => {
    if (user.availableBalance > balance) {
      setBalance(user.availableBalance);
    }
  }, [user.availableBalance]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <aside className="w-64 bg-[#0d121c] border-r border-[#1e2638] flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 hidden md:flex">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e2638]">
        <Logo size="md" showTagline={true} />
      </div>

      {/* User Balance Quick Glance */}
      <div className="mx-4 my-3 p-3.5 rounded-xl bg-[#141b27] border border-[#222c40]">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Available Balance
        </div>
        <div className="text-xl font-bold text-emerald-400 mt-1">
          {formatCurrency(balance)}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5 flex justify-between items-center">
          <span>Pending: {formatCurrency(user.pendingBalance)}</span>
          <Link href="/withdrawals" className="text-emerald-400 hover:underline font-medium">
            Payout
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href) && item.href !== '/links/create');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.adHighlight
                  ? 'bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent text-blue-300 border border-blue-500/30 hover:border-blue-400/50'
                  : item.highlight
                  ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-300 border border-emerald-500/25 hover:border-emerald-500/40 hover:bg-emerald-500/20 my-2'
                  : isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#151b26]'
              }`}
            >
              <Icon className={`w-4 h-4 ${item.adHighlight ? 'text-blue-400 fill-blue-400/30' : isActive || item.highlight ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span>{item.label}</span>
              {item.adHighlight && (
                <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase tracking-wider shadow-sm">
                  Earn $
                </span>
              )}
            </Link>
          );
        })}

        {/* Admin Link if role is ADMIN */}
        {user.role === 'ADMIN' && (
          <div className="pt-3 border-t border-[#1e2638] mt-3">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Admin Center</span>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile App Install Card */}
      <div className="mx-3 my-2 p-3 rounded-xl bg-gradient-to-br from-emerald-950/40 via-[#151c28] to-[#111722] border border-emerald-500/20 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
          <Smartphone className="w-4 h-4" />
          <span>LinkEarn Mobile</span>
        </div>
        <p className="text-[11px] text-gray-400 mb-2.5">
          Install the full app on your phone with zero download errors.
        </p>
        <Link
          href="/download"
          className="w-full text-center py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Smartphone className="w-3.5 h-3.5 text-gray-950 stroke-[2.5]" />
          <span>Install on Phone</span>
        </Link>
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-[#1e2638] bg-[#0c1018]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-gray-950 font-bold flex items-center justify-center text-xs shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
              <div className="text-[11px] text-gray-400 truncate">{user.email}</div>
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
