import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  accent?: 'green' | 'blue' | 'purple' | 'amber' | 'slate';
  badge?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  accent = 'green',
  badge,
}: StatCardProps) {
  const accentStyles = {
    green: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      valueColor: 'text-emerald-400',
    },
    blue: {
      border: 'hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      valueColor: 'text-white',
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      valueColor: 'text-white',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      valueColor: 'text-amber-400',
    },
    slate: {
      border: 'hover:border-gray-600',
      iconBg: 'bg-gray-800 text-gray-300 border-gray-700',
      valueColor: 'text-white',
    },
  };

  const style = accentStyles[accent];

  return (
    <div
      className={`bg-[#151B26] border border-[#232D3F] rounded-2xl p-5 transition-all duration-200 ${style.border} shadow-lg relative overflow-hidden group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
            {title}
          </span>
          {badge && (
            <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${style.iconBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className={`text-2xl lg:text-3xl font-bold tracking-tight ${style.valueColor}`}>
          {value}
        </h3>
        {change && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {change}
          </div>
        )}
      </div>

      {subtitle && <p className="text-xs text-gray-400 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
}
