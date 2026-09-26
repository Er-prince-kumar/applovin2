'use client';

import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, UserCheck, UserX, DollarSign, ExternalLink, Copy, Check, Smartphone, Building2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface AdminUsersViewProps {
  initialUsers: any[];
}

export default function AdminUsersView({ initialUsers }: AdminUsersViewProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter((u) => {
    let parsedPayout: any = null;
    if (u.payoutDetails) {
      try {
        parsedPayout = JSON.parse(u.payoutDetails);
      } catch {}
    }

    const q = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.referralCode.toLowerCase().includes(q) ||
      (parsedPayout?.upiId && parsedPayout.upiId.toLowerCase().includes(q)) ||
      (parsedPayout?.accountNumber && parsedPayout.accountNumber.toLowerCase().includes(q)) ||
      (parsedPayout?.bankName && parsedPayout.bankName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleToggleStatus(u: any) {
    const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change ${u.name}'s status to ${nextStatus}?`)) {
      return;
    }

    setLoadingId(u.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id, status: nextStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, status: nextStatus } : item))
      );
      toast(`User ${u.name} is now ${nextStatus}`, 'info');
    } catch {
      toast('Failed to change user status', 'error');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#151B26] border border-[#232D3F] rounded-2xl p-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search publishers by name, email, referral code, or UPI ID..."
            className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center bg-[#0D121C] border border-[#232D3F] rounded-xl p-1 text-xs">
          {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#232D3F] text-gray-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 font-semibold">User</th>
              <th className="pb-3 font-semibold">Role</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Payment / UPI</th>
              <th className="pb-3 font-semibold">Referral Code</th>
              <th className="pb-3 font-semibold">Links</th>
              <th className="pb-3 font-semibold text-right">Available Bal</th>
              <th className="pb-3 font-semibold text-right">Lifetime Earnings</th>
              <th className="pb-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638]">
            {filteredUsers.map((u) => {
              let payout: any = null;
              if (u.payoutDetails) {
                try {
                  payout = JSON.parse(u.payoutDetails);
                } catch {}
              }

              return (
                <tr key={u.id} className="hover:bg-[#111622] transition-colors">
                  <td className="py-3.5">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-[11px] text-gray-400">{u.email}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Joined: {formatDate(u.createdAt)}</div>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-gray-800 text-gray-300 border border-gray-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    {payout ? (
                      <div className="flex flex-col gap-1">
                        {payout.type === 'UPI' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <Smartphone className="w-2.5 h-2.5" /> UPI
                            </span>
                            <span className="font-mono text-white text-xs font-semibold">{payout.upiId}</span>
                            <button
                              onClick={() => handleCopy(payout.upiId, `upi-${u.id}`)}
                              className="text-gray-400 hover:text-white transition-colors p-1"
                              title="Copy UPI ID"
                            >
                              {copiedId === `upi-${u.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : payout.type === 'BANK_TRANSFER' ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                <Building2 className="w-2.5 h-2.5" /> Bank
                              </span>
                              <span className="text-white text-xs font-medium">{payout.bankName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-mono text-gray-300">
                              <span>A/C: {payout.accountNumber}</span>
                              <button
                                onClick={() => handleCopy(payout.accountNumber, `acc-${u.id}`)}
                                className="text-gray-400 hover:text-white transition-colors p-0.5"
                                title="Copy Account Number"
                              >
                                {copiedId === `acc-${u.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {payout.ifscCode && (
                              <div className="text-[10px] font-mono text-gray-400">IFSC: {payout.ifscCode}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs font-mono">{payout.type}</span>
                        )}
                        {payout.accountHolder && (
                          <span className="text-[10px] text-gray-400">Name: {payout.accountHolder}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-[11px]">Not Linked</span>
                    )}
                  </td>
                  <td className="py-3.5 font-mono text-emerald-400 font-medium">{u.referralCode}</td>
                  <td className="py-3.5 text-gray-300 font-bold">{u._count.links}</td>
                  <td className="py-3.5 text-right font-mono font-bold text-white">
                    {formatCurrency(u.availableBalance)}
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(u.lifetimeEarnings)}
                  </td>
                  <td className="py-3.5 text-center">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={loadingId === u.id}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

