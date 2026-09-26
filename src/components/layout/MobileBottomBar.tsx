'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Link2, Plus, BarChart3, Wallet } from 'lucide-react';

export default function MobileBottomBar() {
  const pathname = usePathname();

  const tabs = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/links', label: 'Links', icon: Link2 },
    { href: '/links/create', label: 'Create', icon: Plus, isCreate: true },
    { href: '/analytics', label: 'Stats', icon: BarChart3 },
    { href: '/withdrawals', label: 'Payouts', icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 backdrop-blur-lg border-t border-[#1E2638] md:hidden px-3 py-2 flex items-center justify-around safe-area-bottom">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== '/dashboard' && pathname?.startsWith(tab.href) && tab.href !== '/links/create');
        const Icon = tab.icon;

        if (tab.isCreate) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center -mt-6 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-gray-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-active:scale-95 transition-transform border-4 border-[#0B0F17]">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 mt-0.5">Create</span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-emerald-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
