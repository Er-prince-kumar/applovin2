'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Plus,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Download,
  Smartphone,
  Play,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface TopbarProps {
  title: string;
  subtitle?: string;
  referralCode?: string;
  onOpenMobileMenu?: () => void;
}

export default function Topbar({
  title,
  subtitle,
  referralCode,
  onOpenMobileMenu,
}: TopbarProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyRef = () => {
    if (!referralCode) return;
    const url = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="h-16 border-b border-[#1e2638] bg-[#0d121c]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a2233] md:hidden transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-400 hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Referral Quick Copy */}
        {referralCode && (
          <button
            onClick={handleCopyRef}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151c28] border border-[#232f48] text-xs font-medium text-gray-300 hover:text-white hover:border-emerald-500/40 transition-all"
            title="Copy your referral link to earn 5% bonus commission"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ref: {referralCode}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        )}

        {/* Ad Tasks Shortcut */}
        <Link
          href="/tasks"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/30 text-blue-300 hover:text-white font-semibold text-xs transition-colors shadow-sm"
          title="Watch Rewarded Ads & Earn Cash"
        >
          <Play className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
          <span>Ad Tasks</span>
        </Link>

        {/* Install Mobile App Shortcut */}
        <Link
          href="/download"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141d2d] hover:bg-[#1c2940] border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-semibold text-xs transition-colors shadow-sm"
          title="Install LinkEarn Mobile App"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile App</span>
        </Link>

        {/* Quick Link Creation */}
        <Link
          href="/links/create"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold text-xs transition-colors shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span className="hidden xs:inline">New Link</span>
        </Link>
      </div>
    </header>
  );
}
