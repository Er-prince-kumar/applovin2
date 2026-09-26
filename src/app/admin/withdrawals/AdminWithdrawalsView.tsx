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
  Building2,
  CreditCard,
  Copy,
  Check,
  Smartphone,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface AdminWithdrawalsViewProps {
  initialWithdrawals: any[];
  usersWithPayout?: any[];
}

export default function AdminWithdrawalsView({
  initialWithdrawals,
  usersWithPayout = [],
}: AdminWithdrawalsViewProps) {
  const [withdrawals, setWithdrawals] = useState<any[]>(initialWithdrawals);
  const [activeTab, setActiveTab] = useState<'PROFILES' | 'REQUESTS'>('PROFILES');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);
  const [actionStatus, setActionStatus] = useState<string>('APPROVED');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesFilter = filter === 'ALL' || w.status === filter;
    const matchesSearch =
      w.user.name.toLowerCase().includes(search.toLowerCase()) ||
      w.user.email.toLowerCase().includes(search.toLowerCase()) ||
      w.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
      w.paymentDetails.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const parsedUsersWithPayout = usersWithPayout.map((u) => {
    let details: any = null;
    if (u.payoutDetails) {
      try {
        details = JSON.parse(u.payoutDetails);
      } catch {
        details = null;
      }
    }
    return { ...u, parsedPayout: details };
  });

  const filteredPayoutProfiles = parsedUsersWithPayout.filter((u) => {
    if (!u.parsedPayout) return false;
    const q = search.toLowerCase();
    const nameMatch = u.name.toLowerCase().includes(q);
    const emailMatch = u.email.toLowerCase().includes(q);
    const typeMatch = (u.parsedPayout.type || '').toLowerCase().includes(q);
    const upiMatch = (u.parsedPayout.upiId || '').toLowerCase().includes(q);
    const bankMatch = (u.parsedPayout.bankName || '').toLowerCase().includes(q);
    const accMatch = (u.parsedPayout.accountNumber || '').toLowerCase().includes(q);

    return nameMatch || emailMatch || typeMatch || upiMatch || bankMatch || accMatch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

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
      {/* Top Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-[#1E2638] pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('PROFILES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'PROFILES'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-[#151B26] text-gray-400 hover:text-white border border-[#232D3F]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Linked User Bank & UPI Accounts</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
            {filteredPayoutProfiles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REQUESTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'REQUESTS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-[#151B26] text-gray-400 hover:text-white border border-[#232D3F]'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Disbursement Requests</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
            {filteredWithdrawals.length}
          </span>
        </button>
      </div>

      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#151B26] border border-[#232D3F] rounded-2xl p-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'PROFILES'
                ? 'Search by publisher, email, UPI ID, or account number...'
                : 'Search disbursements by publisher, email, destination address...'
            }
            className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        {activeTab === 'REQUESTS' && (
          <div className="flex items-center bg-[#0D121C] border border-[#232D3F] rounded-xl p-1 text-xs overflow-x-auto">
            {['ALL', 'PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === st
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Linked Bank & UPI Accounts */}
      {activeTab === 'PROFILES' && (
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Connected Payment Profiles ({filteredPayoutProfiles.length})</span>
              </h3>
              <p className="text-xs text-gray-400">
                Live registry of all publisher bank accounts, UPI VPAs, and wallets configured for payouts.
              </p>
            </div>
          </div>

          {filteredPayoutProfiles.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>No publishers have linked a Bank or UPI account yet.</p>
              <p className="text-gray-500 text-[11px] mt-1">
                As soon as any user links their UPI ID or Bank Account, it will immediately show up here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232D3F] text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Publisher</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Destination / UPI ID</th>
                  <th className="pb-3 font-semibold">Account Holder</th>
                  <th className="pb-3 font-semibold text-right">Available Bal</th>
                  <th className="pb-3 font-semibold">Last Updated</th>
                  <th className="pb-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]">
                {filteredPayoutProfiles.map((u) => {
                  const p = u.parsedPayout;
                  let destinationText = '';
                  if (p.type === 'UPI') destinationText = `UPI ID: ${p.upiId || '—'}`;
                  else if (p.type === 'BANK_TRANSFER')
                    destinationText = `${p.bankName || 'Bank'} A/C: ${p.accountNumber || '—'} (IFSC: ${p.ifscCode || '—'})`;
                  else if (p.type === 'CRYPTO_USDT')
                    destinationText = `TRC20: ${p.usdtAddress || '—'}`;
                  else if (p.type === 'PAYPAL') destinationText = `PayPal: ${p.paypalEmail || '—'}`;
                  else if (p.type === 'EASYPAISA' || p.type === 'JAZZCASH')
                    destinationText = `${p.type}: ${p.walletNumber || '—'}`;
                  else destinationText = p.accountNumber || p.accountHolder || '—';

                  const copyValue = p.type === 'UPI' ? p.upiId : p.accountNumber || destinationText;

                  return (
                    <tr key={u.id} className="hover:bg-[#111622] transition-colors">
                      <td className="py-3.5">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-gray-400">{u.email}</div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            p.type === 'UPI'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : p.type === 'BANK_TRANSFER'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          }`}
                        >
                          {p.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="font-mono text-xs text-white font-medium">
                          {destinationText}
                        </div>
                      </td>
                      <td className="py-3.5 text-gray-300 font-medium">
                        {p.accountHolder || '—'}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(u.availableBalance)}
                      </td>
                      <td className="py-3.5 text-gray-400 text-[11px] whitespace-nowrap">
                        {p.updatedAt ? formatDateTime(p.updatedAt) : formatDate(u.updatedAt)}
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleCopy(copyValue || '', u.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E2638] hover:bg-[#283552] text-gray-200 text-[11px] font-semibold transition-colors"
                        >
                          {copiedId === u.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Withdrawals Table */}
      {activeTab === 'REQUESTS' && (
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
              {filteredWithdrawals.map((w) => (
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
      )}

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
