import React from 'react';
import Link from 'next/link';
import { TrendingUp, Link2 } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  href?: string;
  className?: string;
}

export default function Logo({ size = 'md', showTagline = false, href = '/', className = '' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-3 group ${className}`}>
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center justify-center">
          <Link2 className="w-5 h-5 text-gray-950 stroke-[2.5]" />
          <TrendingUp className="w-3.5 h-3.5 text-white absolute -top-1 -right-1 drop-shadow" />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-extrabold tracking-tight text-white ${textSizes[size]}`}>
            Link<span className="text-emerald-400">Earn</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>
        {showTagline && (
          <span className="text-[10px] text-gray-400 tracking-wide uppercase font-medium">
            Performance Monetization
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
