'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface AdminWithdrawalsViewProps {
  initialWithdrawals: any[];
}

export default function AdminWithdrawalsView({ initialWithdrawals }: AdminWithdrawalsViewProps) {
  const [withdrawals, setWithdrawals] = useState<any[]>(initialWithdrawals);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);
  const [actionStatus, setActionStatus] = useState<string>('APPROVED');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const filtered = withdrawals.filter((w) => {
    const matchesFilter = filter === 'ALL' || w.status === filter;
    const matchesSearch =
      w.user.name.toLowerCase().includes(search.toLowerCase()) ||
      w.user.email.toLowerCase().includes(search.toLowerCase()) ||
      w.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
      w.paymentDetails.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const openActionModal = (item: any, defaultNext: string) => {
    setActiveModalItem(item);
    setActionStatus(defaultNext);
    setAdminNote(item.adminNote || '');
  };

  async function handleConfirmAction(e: React.FormEvent) {
    e.preventDefault();
    if (!activeModalItem) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId: activeModalItem.id,
          status: actionStatus,
          adminNote: adminNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update withdrawal');

      setWithdrawals((prev) =>
        prev.map((item) => (item.id === activeModalItem.id ? data.withdrawal : item))
      );

      toast(`Withdrawal #${activeModalItem.id.substring(0, 8)} updated to ${actionStatus}`, 'success');
      setActiveModalItem(null);
    } catch (err: any) {
      toast(err.message || 'Error updating status', 'error');
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            PAID
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            PROCESSING
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            REJECTED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#151B26] border border-[#232D3F] rounded-2xl p-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search disbursements by publisher, email, destination address..."
            className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center bg-[#0D121C] border border-[#232D3F] rounded-xl p-1 text-xs overflow-x-auto">
          {['ALL', 'PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === st ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#232D3F] text-gray-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 font-semibold">Request Date</th>
              <th className="pb-3 font-semibold">Publisher</th>
              <th className="pb-3 font-semibold">Method & Target Account</th>
              <th className="pb-3 font-semibold text-right">Amount</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Admin Audit Note</th>
              <th className="pb-3 font-semibold text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638]">
            {filtered.map((w) => (
              <tr key={w.id} className="hover:bg-[#111622] transition-colors">
                <td className="py-3.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                  {formatDate(w.createdAt)}
                </td>
                <td className="py-3.5">
                  <div className="font-semibold text-white">{w.user.name}</div>
                  <div className="text-[11px] text-gray-400">{w.user.email}</div>
                </td>
                <td className="py-3.5">
                  <span className="font-bold text-gray-200">{w.paymentMethod}</span>
                  <div className="font-mono text-[11px] text-gray-400 max-w-xs truncate">
                    {w.paymentDetails}
                  </div>
                </td>
                <td className="py-3.5 text-right font-bold text-sm text-emerald-400">
                  {formatCurrency(w.amount)}
                </td>
                <td className="py-3.5">{getStatusBadge(w.status)}</td>
                <td className="py-3.5 text-gray-400 italic max-w-xs truncate">
                  {w.adminNote || '—'}
                </td>
                <td className="py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {w.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => openActionModal(w, 'APPROVED')}
                          className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[11px] font-semibold border border-blue-500/20"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openActionModal(w, 'REJECTED')}
                          className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[11px] font-semibold border border-rose-500/20"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {w.status === 'APPROVED' && (
                      <button
                        onClick={() => openActionModal(w, 'PROCESSING')}
                        className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-[11px] font-semibold border border-purple-500/20"
                      >
                        Process
                      </button>
                    )}

                    {w.status === 'PROCESSING' && (
                      <button
                        onClick={() => openActionModal(w, 'PAID')}
                        className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-semibold border border-emerald-500/20"
                      >
                        Mark Paid
                      </button>
                    )}

                    {w.status === 'PAID' && (
                      <span className="text-[11px] text-gray-400">Complete</span>
                    )}

                    {w.status === 'REJECTED' && (
                      <span className="text-[11px] text-rose-400">Refunded</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Dialog */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveModalItem(null)}
          />

          <div className="relative w-full max-w-md bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-1">Update Payout Status</h3>
            <p className="text-xs text-gray-400 mb-4">
              Payout #{activeModalItem.id.substring(0, 8)} &bull; {activeModalItem.user.name} &bull;{' '}
              <strong className="text-emerald-400">{formatCurrency(activeModalItem.amount)}</strong>
            </p>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Target Status *
                </label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                  className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="APPROVED">APPROVED (Authorized for dispatch)</option>
                  <option value="PROCESSING">PROCESSING (Batch transmission ongoing)</option>
                  <option value="PAID">PAID (Disbursement settled / Tx broadcast)</option>
                  <option value="REJECTED">REJECTED (Refund balance to user available balance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Admin Note / Transaction Hash / Reason
                </label>
                <input
                  type="text"
                  required={actionStatus === 'REJECTED' || actionStatus === 'PAID'}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    actionStatus === 'PAID'
                      ? 'Tx Hash or MassPay Batch ID'
                      : actionStatus === 'REJECTED'
                      ? 'Reason for payout rejection'
                      : 'Internal accounting note'
                  }
                  className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#1E2638] text-xs font-semibold text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
