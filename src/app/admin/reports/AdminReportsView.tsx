'use client';

import React from 'react';
import { FileSpreadsheet, Download, ShieldCheck, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface AdminReportsViewProps {
  totalEarnings: number;
  totalPaid: number;
  totalPending: number;
  clickBreakdown: Record<string, number>;
  usersCount: number;
}

export default function AdminReportsView({
  totalEarnings,
  totalPaid,
  totalPending,
  clickBreakdown,
  usersCount,
}: AdminReportsViewProps) {
  const { toast } = useToast();

  const totalClicks = (clickBreakdown.VALID || 0) + (clickBreakdown.SUSPICIOUS || 0) + (clickBreakdown.INVALID || 0);
  const cleanTrafficRatio = totalClicks > 0 ? ((clickBreakdown.VALID / totalClicks) * 100).toFixed(1) : '100';
  const grossTurnover = totalEarnings / 0.85; // 15% platform margin
  const platformNetMargin = grossTurnover - totalEarnings;

  function handleExportCSV() {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Metric,Value',
        `Generated Date,${new Date().toISOString()}`,
        `Total Registered Publishers,${usersCount}`,
        `Estimated Gross Advertiser Volume,$${grossTurnover.toFixed(2)}`,
        `Publisher Accrued Earnings,$${totalEarnings.toFixed(2)}`,
        `Settled Disbursements (Paid),$${totalPaid.toFixed(2)}`,
        `Pending Payout Liability,$${totalPending.toFixed(2)}`,
        `Platform Net Margin (15%),$${platformNetMargin.toFixed(2)}`,
        `Total Click Events,${totalClicks}`,
        `Valid Click Events,${clickBreakdown.VALID || 0}`,
        `Suspicious Events,${clickBreakdown.SUSPICIOUS || 0}`,
        `Invalid / Bot Events,${clickBreakdown.INVALID || 0}`,
        `Clean Traffic Ratio,${cleanTrafficRatio}%`,
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `linkearn_audit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast('Financial report CSV downloaded', 'success');
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Executive Financial & Traffic Audit</h3>
          <p className="text-xs text-gray-400">
            Consolidated platform accounting and quality compliance report
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* P&L Statement Grid */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300">
          Financial Position & Liabilities
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Gross Advertiser Volume
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {formatCurrency(grossTurnover)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Estimated gross ad billing</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Publisher Earnings Accrued
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {formatCurrency(totalEarnings)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">85% publisher revenue pool</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Settled Payouts
            </div>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {formatCurrency(totalPaid)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Funds disbursed</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Net Platform Margin
            </div>
            <div className="text-xl font-bold text-blue-400 mt-1">
              {formatCurrency(platformNetMargin)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">15% platform spread</div>
          </div>
        </div>
      </div>

      {/* Traffic Audit */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
          Traffic Quality Compliance Audit
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-xs text-gray-400">Clean Traffic Ratio</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {cleanTrafficRatio}%
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Legitimate publisher visitors</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-xs text-gray-400">Total Valid Events</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatNumber(clickBreakdown.VALID || 0)}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Credited to publishers</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D121C] border border-[#1E2638]">
            <div className="text-xs text-gray-400">Defensively Blocked / Flagged</div>
            <div className="text-2xl font-extrabold text-red-400 mt-1">
              {formatNumber((clickBreakdown.SUSPICIOUS || 0) + (clickBreakdown.INVALID || 0))}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Prevented invalid ad clicks</div>
          </div>
        </div>
      </div>
    </div>
  );
}
