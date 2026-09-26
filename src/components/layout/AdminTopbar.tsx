'use client';

import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface AdminTopbarProps {
  title: string;
  subtitle?: string;
}

export default function AdminTopbar({ title, subtitle }: AdminTopbarProps) {
  return (
    <header className="h-16 border-b border-[#1a2233] bg-[#0a0d14]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            Admin
          </span>
        </div>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141b27] border border-[#232f48] text-xs text-gray-300">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fraud Engine Active</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Superadmin</span>
        </div>
      </div>
    </header>
  );
}
