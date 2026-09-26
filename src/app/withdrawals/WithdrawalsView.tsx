'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Shield,
  CreditCard,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface WithdrawalRecord {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentDetails: string;
  notes: string | null;
  adminNote: string | null;
  status: string;
  createdAt: string | Date;
  processedAt: string | Date | null;
}

interface WithdrawalsViewProps {
  initialWithdrawals: WithdrawalRecord[];
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  totalWithdrawn: number;
  minWithdrawal: number;
}

export default function WithdrawalsView({
  initialWithdrawals,
  availableBalance,
  pendingBalance,
  lifetimeEarnings,
  totalWithdrawn,
  minWithdrawal,
}: WithdrawalsViewProps) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(initialWithdrawals);
  const [available, setAvailable] = useState(availableBalance);
  const [pending, setPending] = useState(pendingBalance);

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PAYPAL' | 'CRYPTO_USDT' | 'WIRE_TRANSFER' | 'PAYONEER'>('PAYPAL');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < minWithdrawal) {
      setError(`Minimum withdrawal amount is $${minWithdrawal.toFixed(2)}`);
      return;
    }

    if (numericAmount > available) {
      setError(`Insufficient available balance ($${available.toFixed(2)})`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          paymentMethod,
          paymentDetails,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal request');
      }

      setWithdrawals((prev) => [data.withdrawal, ...prev]);
      setAvailable((prev) => prev - numericAmount);
      setPending((prev) => prev + numericAmount);

      toast('Withdrawal request submitted for review!', 'success');
      setShowModal(false);
      setAmount('');
      setPaymentDetails('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Error processing request');
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
    <div className="space-y-8">
      {/* Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Balance"
          value={formatCurrency(available)}
          subtitle={`Min withdrawal: $${minWithdrawal.toFixed(2)}`}
          icon={Wallet}
          accent="green"
        />

        <StatCard
          title="Pending Review"
          value={formatCurrency(pending)}
          subtitle="Currently in settlement queue"
          icon={Clock}
          accent="amber"
        />

        <StatCard
          title="Lifetime Earnings"
          value={formatCurrency(lifetimeEarnings)}
          subtitle="All-time verified publisher yield"
          icon={TrendingUp}
          accent="blue"
        />

        <StatCard
          title="Total Paid Out"
          value={formatCurrency(totalWithdrawn)}
          subtitle="Disbursed to external accounts"
          icon={CheckCircle2}
          accent="purple"
        />
      </div>

      {/* Action Banner */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-base font-bold text-white mb-1">Request Funds Disbursement</h3>
          <p className="text-xs text-gray-400">
            Available funds are sent within 24-48 business hours via your selected payout method.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setError(null);
          }}
          disabled={available < minWithdrawal}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* Withdrawal Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-lg bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-1">New Withdrawal Request</h3>
            <p className="text-xs text-gray-400 mb-5">
              Available Balance: <strong className="text-emerald-400">{formatCurrency(available)}</strong>
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Amount (USD) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmount(available.toString())}
                    className="text-[11px] text-emerald-400 hover:underline font-semibold"
                  >
                    Withdraw All ({formatCurrency(available)})
                  </button>
                </div>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    step="0.01"
                    min={minWithdrawal}
                    max={available}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min $${minWithdrawal.toFixed(2)}`}
                    className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PAYPAL">PayPal (MassPay)</option>
                  <option value="CRYPTO_USDT">USDT (TRC20 Network)</option>
                  <option value="WIRE_TRANSFER">Direct Bank Wire / ACH</option>
                  <option value="PAYONEER">Payoneer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Payment Details / Address *
                </label>
                <input
                  type="text"
                  required
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder={
                    paymentMethod === 'PAYPAL'
                      ? 'your.email@paypal.com'
                      : paymentMethod === 'CRYPTO_USDT'
                      ? 'TRC20 Wallet Address (e.g. TLyqzV...)'
                      : paymentMethod === 'PAYONEER'
                      ? 'Payoneer Email ID'
                      : 'Bank Name, Account Number, SWIFT/Routing'
                  }
                  className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Notes / Instructions (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional memo or transaction note"
                  className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E2638] text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Disbursement History</h3>

        {withdrawals.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            No withdrawal requests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232D3F] text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Date Requested</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Destination Account</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Admin Note</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#111622] transition-colors">
                    <td className="py-3.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(w.createdAt)}
                    </td>
                    <td className="py-3.5 font-semibold text-white">{w.paymentMethod}</td>
                    <td className="py-3.5 text-gray-300 font-mono text-[11px] max-w-xs truncate">
                      {w.paymentDetails}
                    </td>
                    <td className="py-3.5">{getStatusBadge(w.status)}</td>
                    <td className="py-3.5 text-gray-400 italic">
                      {w.adminNote || (w.notes ? `User note: ${w.notes}` : '—')}
                    </td>
                    <td className="py-3.5 text-right font-bold text-sm text-emerald-400">
                      {formatCurrency(w.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
