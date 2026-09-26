'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Building2,
  Edit3,
  Smartphone,
  Check,
  Zap,
  Lock,
  Trash2,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export const SAVED_BANK_STORAGE_KEY = 'linkearn_saved_bank_details';

export interface PayoutMethodData {
  type:
    | 'BANK_TRANSFER'
    | 'UPI'
    | 'WIRE_TRANSFER'
    | 'PAYPAL'
    | 'CRYPTO_USDT'
    | 'PAYONEER'
    | 'EASYPAISA'
    | 'JAZZCASH';
  accountHolder: string;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  accountType?: string | null;
  upiId?: string | null;
  walletNumber?: string | null;
  paypalEmail?: string | null;
  usdtAddress?: string | null;
  updatedAt?: string;
}

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
  userId: string;
  initialWithdrawals: WithdrawalRecord[];
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  totalWithdrawn: number;
  minWithdrawal: number;
  initialPayoutMethod?: PayoutMethodData | null;
}

export default function WithdrawalsView({
  userId,
  initialWithdrawals,
  availableBalance,
  pendingBalance,
  lifetimeEarnings,
  totalWithdrawn,
  minWithdrawal,
  initialPayoutMethod,
}: WithdrawalsViewProps) {
  const router = useRouter();
  const userStorageKey = `linkearn_saved_bank_${userId}`;
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(initialWithdrawals);
  const [available, setAvailable] = useState(availableBalance);
  const [pending, setPending] = useState(pendingBalance);

  // Saved Bank Account state
  const [savedMethod, setSavedMethod] = useState<PayoutMethodData | null>(
    initialPayoutMethod || null
  );
  const [showBankModal, setShowBankModal] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [unlinkingBank, setUnlinkingBank] = useState(false);
  const [bankModalError, setBankModalError] = useState<string | null>(null);

  // Bank form state (for editing/adding bank account directly)
  const [bankFormType, setBankFormType] = useState<
    'BANK_TRANSFER' | 'UPI' | 'EASYPAISA' | 'JAZZCASH' | 'PAYPAL' | 'CRYPTO_USDT'
  >((savedMethod?.type as any) || 'BANK_TRANSFER');
  const [bankAccountHolder, setBankAccountHolder] = useState(savedMethod?.accountHolder || '');
  const [bankName, setBankName] = useState(savedMethod?.bankName || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(savedMethod?.accountNumber || '');
  const [bankConfirmAccountNumber, setBankConfirmAccountNumber] = useState(
    savedMethod?.accountNumber || ''
  );
  const [bankIfscCode, setBankIfscCode] = useState(savedMethod?.ifscCode || '');
  const [bankAccountType, setBankAccountType] = useState(savedMethod?.accountType || 'Savings');
  const [bankUpiId, setBankUpiId] = useState(savedMethod?.upiId || '');
  const [bankWalletNumber, setBankWalletNumber] = useState(savedMethod?.walletNumber || '');
  const [bankPaypalEmail, setBankPaypalEmail] = useState(savedMethod?.paypalEmail || '');
  const [bankUsdtAddress, setBankUsdtAddress] = useState(savedMethod?.usdtAddress || '');

  // Payout request modal state
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [useSavedMethod, setUseSavedMethod] = useState(Boolean(savedMethod));
  const [reqMethod, setReqMethod] = useState<
    'BANK_TRANSFER' | 'UPI' | 'EASYPAISA' | 'JAZZCASH' | 'PAYPAL' | 'CRYPTO_USDT' | 'WIRE_TRANSFER'
  >('BANK_TRANSFER');

  // Ad-hoc payout request fields
  const [reqHolder, setReqHolder] = useState('');
  const [reqBankName, setReqBankName] = useState('');
  const [reqAccNumber, setReqAccNumber] = useState('');
  const [reqConfirmAccNumber, setReqConfirmAccNumber] = useState('');
  const [reqIfsc, setReqIfsc] = useState('');
  const [reqUpiId, setReqUpiId] = useState('');
  const [reqWalletNumber, setReqWalletNumber] = useState('');
  const [reqPaypalEmail, setReqPaypalEmail] = useState('');
  const [reqUsdtAddress, setReqUsdtAddress] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  // Persistent Hydration: Auto-sync bank account with user-scoped localStorage and API on mount
  useEffect(() => {
    // 0. Remove legacy un-scoped storage key
    try {
      localStorage.removeItem('linkearn_saved_bank_details');
    } catch {}

    // 1. Instant fallback from user-specific localStorage
    try {
      const cached = localStorage.getItem(userStorageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && parsed.type) {
          setSavedMethod((current) => current || parsed);
          setUseSavedMethod(true);
        }
      }
    } catch (e) {
      console.warn('Could not read cached bank details:', e);
    }

    // 2. Fetch authoritative bank state from server for this logged-in user
    async function fetchPayoutMethod() {
      try {
        const res = await fetch('/api/user/payout-method', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.payoutDetails) {
            setSavedMethod(data.payoutDetails);
            setUseSavedMethod(true);
            try {
              localStorage.setItem(userStorageKey, JSON.stringify(data.payoutDetails));
            } catch {}
          } else {
            // User does not have any saved payout method yet
            setSavedMethod(null);
            setUseSavedMethod(false);
            try {
              localStorage.removeItem(userStorageKey);
            } catch {}
          }
        }
      } catch (err) {
        console.error('Error fetching payout method:', err);
      }
    }

    fetchPayoutMethod();
  }, [userStorageKey]);

  // Synchronize form fields whenever savedMethod changes or modal opens
  const handleOpenBankModal = () => {
    if (savedMethod) {
      setBankFormType((savedMethod.type as any) || 'BANK_TRANSFER');
      setBankAccountHolder(savedMethod.accountHolder || '');
      setBankName(savedMethod.bankName || '');
      setBankAccountNumber(savedMethod.accountNumber || '');
      setBankConfirmAccountNumber(savedMethod.accountNumber || '');
      setBankIfscCode(savedMethod.ifscCode || '');
      setBankAccountType(savedMethod.accountType || 'Savings');
      setBankUpiId(savedMethod.upiId || '');
      setBankWalletNumber(savedMethod.walletNumber || '');
      setBankPaypalEmail(savedMethod.paypalEmail || '');
      setBankUsdtAddress(savedMethod.usdtAddress || '');
    }
    setBankModalError(null);
    setShowBankModal(true);
  };

  // Handle Unlinking / Removing Saved Bank Account
  async function handleUnlinkBank() {
    if (!confirm('Are you sure you want to remove your saved bank account?')) return;
    setUnlinkingBank(true);
    try {
      const res = await fetch('/api/user/payout-method', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to unlink bank account');

      setSavedMethod(null);
      setUseSavedMethod(false);
      try {
        localStorage.removeItem(SAVED_BANK_STORAGE_KEY);
      } catch {}

      router.refresh();
      toast('Bank account unlinked successfully', 'info');
    } catch (err: any) {
      toast(err.message || 'Error unlinking bank account', 'error');
    } finally {
      setUnlinkingBank(false);
    }
  }

  // Handle Save / Update Bank Account Modal
  async function handleSaveBankAccount(e: React.FormEvent) {
    e.preventDefault();
    setBankModalError(null);

    if (bankFormType === 'BANK_TRANSFER') {
      if (!bankAccountHolder.trim() || !bankName.trim() || !bankAccountNumber.trim()) {
        setBankModalError('Please fill in Account Holder, Bank Name, and Account Number');
        return;
      }
      if (bankAccountNumber.trim() !== bankConfirmAccountNumber.trim()) {
        setBankModalError('Account numbers do not match! Please check again.');
        return;
      }
      if (!bankIfscCode.trim()) {
        setBankModalError('Please enter your IFSC code or SWIFT code');
        return;
      }
    } else if (bankFormType === 'UPI') {
      if (!bankUpiId.trim() || !bankAccountHolder.trim()) {
        setBankModalError('Please enter both your UPI ID and Account Holder Name');
        return;
      }
    }

    setSavingBank(true);

    const payload: PayoutMethodData = {
      type: bankFormType,
      accountHolder: bankAccountHolder.trim(),
      bankName: bankFormType === 'BANK_TRANSFER' ? bankName.trim() : null,
      accountNumber: bankFormType === 'BANK_TRANSFER' ? bankAccountNumber.trim() : null,
      ifscCode: bankFormType === 'BANK_TRANSFER' ? bankIfscCode.trim().toUpperCase() : null,
      accountType: bankFormType === 'BANK_TRANSFER' ? bankAccountType : null,
      upiId: bankFormType === 'UPI' ? bankUpiId.trim() : null,
      walletNumber:
        bankFormType === 'EASYPAISA' || bankFormType === 'JAZZCASH'
          ? bankWalletNumber.trim()
          : null,
      paypalEmail: bankFormType === 'PAYPAL' ? bankPaypalEmail.trim() : null,
      usdtAddress: bankFormType === 'CRYPTO_USDT' ? bankUsdtAddress.trim() : null,
    };

    try {
      const res = await fetch('/api/user/payout-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save bank account');
      }

      setSavedMethod(payload);
      setUseSavedMethod(true);
      setShowBankModal(false);

      // Persist in localStorage to ensure instantaneous rendering on page reload/PWA resume
      try {
        localStorage.setItem(SAVED_BANK_STORAGE_KEY, JSON.stringify(payload));
      } catch {}

      // Refresh server component to invalidate RSC payload cache
      router.refresh();

      toast('Bank account linked permanently!', 'success');
    } catch (err: any) {
      setBankModalError(err.message || 'Error saving bank account');
    } finally {
      setSavingBank(false);
    }
  }

  // Handle Submit Payout Request
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

    let finalMethod = reqMethod;
    let finalDetails = '';
    let structuredPayload: any = null;

    if (useSavedMethod && savedMethod) {
      finalMethod = savedMethod.type as any;
      if (savedMethod.type === 'BANK_TRANSFER') {
        finalDetails = `Bank: ${savedMethod.bankName} | A/C: ${savedMethod.accountNumber} | Holder: ${savedMethod.accountHolder} | IFSC: ${savedMethod.ifscCode}`;
      } else if (savedMethod.type === 'UPI') {
        finalDetails = `UPI ID: ${savedMethod.upiId} | Name: ${savedMethod.accountHolder}`;
      } else if (savedMethod.type === 'EASYPAISA' || savedMethod.type === 'JAZZCASH') {
        finalDetails = `${savedMethod.type}: ${savedMethod.walletNumber} | Name: ${savedMethod.accountHolder}`;
      } else if (savedMethod.type === 'PAYPAL') {
        finalDetails = `PayPal: ${savedMethod.paypalEmail}`;
      } else if (savedMethod.type === 'CRYPTO_USDT') {
        finalDetails = `USDT TRC20: ${savedMethod.usdtAddress}`;
      } else {
        finalDetails = `${savedMethod.type}: ${savedMethod.accountHolder}`;
      }
    } else {
      // Validate ad-hoc inputs
      if (reqMethod === 'BANK_TRANSFER') {
        if (!reqHolder.trim() || !reqBankName.trim() || !reqAccNumber.trim()) {
          setError('Please provide Account Holder, Bank Name, and Account Number');
          return;
        }
        if (reqAccNumber.trim() !== reqConfirmAccNumber.trim()) {
          setError('Bank account numbers do not match');
          return;
        }
        if (!reqIfsc.trim()) {
          setError('Please provide IFSC or SWIFT code');
          return;
        }
        finalDetails = `Bank: ${reqBankName.trim()} | A/C: ${reqAccNumber.trim()} | Holder: ${reqHolder.trim()} | IFSC: ${reqIfsc.trim().toUpperCase()}`;
        structuredPayload = {
          type: 'BANK_TRANSFER',
          accountHolder: reqHolder.trim(),
          bankName: reqBankName.trim(),
          accountNumber: reqAccNumber.trim(),
          ifscCode: reqIfsc.trim().toUpperCase(),
        };
      } else if (reqMethod === 'UPI') {
        if (!reqUpiId.trim() || !reqHolder.trim()) {
          setError('Please provide UPI ID and Account Holder Name');
          return;
        }
        finalDetails = `UPI ID: ${reqUpiId.trim()} | Name: ${reqHolder.trim()}`;
        structuredPayload = {
          type: 'UPI',
          accountHolder: reqHolder.trim(),
          upiId: reqUpiId.trim(),
        };
      } else if (reqMethod === 'EASYPAISA' || reqMethod === 'JAZZCASH') {
        if (!reqWalletNumber.trim() || !reqHolder.trim()) {
          setError('Please provide Mobile Wallet Number and Account Name');
          return;
        }
        finalDetails = `${reqMethod}: ${reqWalletNumber.trim()} | Name: ${reqHolder.trim()}`;
        structuredPayload = {
          type: reqMethod,
          accountHolder: reqHolder.trim(),
          walletNumber: reqWalletNumber.trim(),
        };
      } else if (reqMethod === 'PAYPAL') {
        if (!reqPaypalEmail.trim()) {
          setError('Please provide PayPal email address');
          return;
        }
        finalDetails = `PayPal: ${reqPaypalEmail.trim()}`;
        structuredPayload = {
          type: 'PAYPAL',
          accountHolder: reqPaypalEmail.trim(),
          paypalEmail: reqPaypalEmail.trim(),
        };
      } else if (reqMethod === 'CRYPTO_USDT') {
        if (!reqUsdtAddress.trim()) {
          setError('Please provide USDT TRC20 wallet address');
          return;
        }
        finalDetails = `USDT TRC20: ${reqUsdtAddress.trim()}`;
        structuredPayload = {
          type: 'CRYPTO_USDT',
          accountHolder: reqUsdtAddress.trim(),
          usdtAddress: reqUsdtAddress.trim(),
        };
      }
    }

    setLoading(true);

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          paymentMethod: finalMethod,
          paymentDetails: finalDetails,
          saveAsDefault,
          structuredDetails: structuredPayload,
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

      if (saveAsDefault && structuredPayload) {
        setSavedMethod(structuredPayload);
        setUseSavedMethod(true);
        try {
          localStorage.setItem(SAVED_BANK_STORAGE_KEY, JSON.stringify(structuredPayload));
        } catch {}
        router.refresh();
      }

      toast('Withdrawal request submitted for review!', 'success');
      setShowModal(false);
      setAmount('');
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

      {/* Linked Bank Account / Payout Method Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141b27] via-[#101724] to-[#121927] border border-[#222d42] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white">Linked Bank Account & Payout</h3>
                {savedMethod ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified for Instant Payouts</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                    <AlertCircle className="w-3 h-3" />
                    <span>No Bank Account Linked</span>
                  </span>
                )}
              </div>

              {savedMethod ? (
                <div className="text-xs text-gray-300 space-y-1 mt-1.5">
                  {savedMethod.type === 'BANK_TRANSFER' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                      <div>
                        <span className="text-gray-400">Bank:</span>{' '}
                        <strong className="text-white">{savedMethod.bankName}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">A/C Holder:</span>{' '}
                        <strong className="text-white">{savedMethod.accountHolder}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">A/C Number:</span>{' '}
                        <span className="font-mono text-emerald-400">
                          ••••••••{savedMethod.accountNumber?.slice(-4) || '****'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">IFSC Code:</span>{' '}
                        <span className="font-mono text-gray-200">{savedMethod.ifscCode}</span>
                      </div>
                    </div>
                  )}

                  {savedMethod.type === 'UPI' && (
                    <div>
                      <span className="text-gray-400">UPI ID:</span>{' '}
                      <strong className="text-emerald-400 font-mono">{savedMethod.upiId}</strong>
                      <span className="mx-2 text-gray-500">&bull;</span>
                      <span className="text-gray-400">Holder:</span>{' '}
                      <strong className="text-white">{savedMethod.accountHolder}</strong>
                    </div>
                  )}

                  {(savedMethod.type === 'EASYPAISA' || savedMethod.type === 'JAZZCASH') && (
                    <div>
                      <span className="text-gray-400">{savedMethod.type}:</span>{' '}
                      <strong className="text-emerald-400 font-mono">
                        {savedMethod.walletNumber}
                      </strong>
                      <span className="mx-2 text-gray-500">&bull;</span>
                      <span className="text-gray-400">Holder:</span>{' '}
                      <strong className="text-white">{savedMethod.accountHolder}</strong>
                    </div>
                  )}

                  {savedMethod.type === 'PAYPAL' && (
                    <div>
                      <span className="text-gray-400">PayPal Email:</span>{' '}
                      <strong className="text-blue-400">{savedMethod.paypalEmail}</strong>
                    </div>
                  )}

                  {savedMethod.type === 'CRYPTO_USDT' && (
                    <div>
                      <span className="text-gray-400">USDT TRC20:</span>{' '}
                      <span className="font-mono text-emerald-400 break-all">
                        {savedMethod.usdtAddress}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 max-w-xl">
                  Apna Bank Account (A/C No, IFSC, Bank Name) ya UPI ID add karein taaki aapka ad
                  earning payout direct aapke bank me transfer ho sake.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {savedMethod && (
              <button
                type="button"
                onClick={handleUnlinkBank}
                disabled={unlinkingBank}
                title="Remove linked bank details"
                className="px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unlink</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenBankModal}
              className="px-4 py-2.5 rounded-xl bg-[#1d263b] hover:bg-[#283552] border border-[#2b3a5b] text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{savedMethod ? 'Edit Bank Account' : 'Add Bank Account'}</span>
            </button>

            <button
              onClick={() => {
                setShowModal(true);
                setError(null);
              }}
              disabled={available < minWithdrawal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Request Payout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add or Edit Bank Account Directly */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowBankModal(false)}
          />

          <div className="relative w-full max-w-lg bg-[#111724] border border-[#232D3F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2638] mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span>{savedMethod ? 'Update Bank Account' : 'Add Bank Account for Payout'}</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Enter your verified bank or UPI details for secure earnings withdrawal.
                </p>
              </div>
            </div>

            {bankModalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{bankModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveBankAccount} className="space-y-4">
              {/* Payment Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Payout Method Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'BANK_TRANSFER', label: 'Bank Account (IMPS/NEFT)' },
                    { id: 'UPI', label: 'UPI / GPay / PhonePe' },
                    { id: 'EASYPAISA', label: 'Easypaisa' },
                    { id: 'JAZZCASH', label: 'JazzCash' },
                    { id: 'PAYPAL', label: 'PayPal' },
                    { id: 'CRYPTO_USDT', label: 'USDT (TRC20)' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setBankFormType(m.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        bankFormType === m.id
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                          : 'bg-[#0B0F17] border-[#1E2638] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Account Holder Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="e.g. Prince Kumar Singh"
                  className="w-full bg-[#090D16] border border-[#1E2638] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Conditional: Bank Account Details */}
              {bankFormType === 'BANK_TRANSFER' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. State Bank of India, HDFC Bank, ICICI Bank"
                      className="w-full bg-[#090D16] border border-[#1E2638] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        Account Number *
                      </label>
                      <input
                        type="password"
                        required
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="Enter Bank Account Number"
                        className="w-full bg-[#090D16] border border-[#1E2638] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        Confirm Account Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankConfirmAccountNumber}
                        onChange={(e) => setBankConfirmAccountNumber(e.target.value)}
                        placeholder="Re-enter Account Number"
                        className="w-full bg-[#090D16] border border-[#1E2638] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        IFSC Code / SWIFT Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankIfscCode}
                        onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SBIN0001234 or HDFC0000123"
                        className="w-full bg-[#090D16] border border-[#1E2638] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        Account Type
                      </label>
                      <select
                        value={bankAccountType}
                        onChange={(e) => setBankAccountType(e.target.value)}
                        className="w-full bg-[#090D16] border border-[#1E2638] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Savings">Savings Account</option>
                        <option value="Current">Current Account</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional: UPI Details */}
              {bankFormType === 'UPI' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    UPI ID (VPA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankUpiId}
                    onChange={(e) => setBankUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                    className="w-full bg-[#090D16] border border-[#1E2638] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Direct instant settlement to your bank via PhonePe, Google Pay, or Paytm.
                  </p>
                </div>
              )}

              {/* Conditional: Mobile Wallet Details */}
              {(bankFormType === 'EASYPAISA' || bankFormType === 'JAZZCASH') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    {bankFormType} Mobile Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankWalletNumber}
                    onChange={(e) => setBankWalletNumber(e.target.value)}
                    placeholder="e.g. 03001234567"
                    className="w-full bg-[#090D16] border border-[#1E2638] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              )}

              {/* Conditional: PayPal */}
              {bankFormType === 'PAYPAL' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    PayPal Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={bankPaypalEmail}
                    onChange={(e) => setBankPaypalEmail(e.target.value)}
                    placeholder="youremail@domain.com"
                    className="w-full bg-[#090D16] border border-[#1E2638] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Conditional: Crypto USDT */}
              {bankFormType === 'CRYPTO_USDT' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    USDT TRC20 Wallet Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankUsdtAddress}
                    onChange={(e) => setBankUsdtAddress(e.target.value)}
                    placeholder="TLyqzVxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#090D16] border border-[#1E2638] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E2638] text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBank}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {savingBank ? 'Saving...' : 'Save Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-lg bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">New Withdrawal Request</h3>
            <p className="text-xs text-gray-400 mb-5">
              Available Balance:{' '}
              <strong className="text-emerald-400">{formatCurrency(available)}</strong>
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
                    className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              {/* If Saved Bank Account is Available, give 1-click option */}
              {savedMethod && (
                <div className="p-3.5 rounded-xl bg-[#0E1522] border border-[#22314d] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={useSavedMethod}
                        onChange={() => setUseSavedMethod(true)}
                        className="text-emerald-500 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-emerald-300">
                        Disburse to Linked {savedMethod.type.replace(/_/g, ' ')}
                      </span>
                    </label>
                  </div>

                  {useSavedMethod && (
                    <div className="text-[11px] text-gray-300 pl-6 space-y-0.5">
                      {savedMethod.type === 'BANK_TRANSFER' && (
                        <div>
                          Bank: <strong>{savedMethod.bankName}</strong> (A/C:{' '}
                          <span className="font-mono text-emerald-400">
                            ••••{savedMethod.accountNumber?.slice(-4)}
                          </span>
                          ) &bull; Holder: <strong>{savedMethod.accountHolder}</strong>
                        </div>
                      )}
                      {savedMethod.type === 'UPI' && (
                        <div>
                          UPI ID: <strong>{savedMethod.upiId}</strong> ({savedMethod.accountHolder})
                        </div>
                      )}
                      {(savedMethod.type === 'EASYPAISA' || savedMethod.type === 'JAZZCASH') && (
                        <div>
                          {savedMethod.type}: <strong>{savedMethod.walletNumber}</strong> (
                          {savedMethod.accountHolder})
                        </div>
                      )}
                      {savedMethod.type === 'PAYPAL' && (
                        <div>
                          PayPal: <strong>{savedMethod.paypalEmail}</strong>
                        </div>
                      )}
                      {savedMethod.type === 'CRYPTO_USDT' && (
                        <div>
                          USDT: <strong className="font-mono">{savedMethod.usdtAddress}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-1 pl-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!useSavedMethod}
                        onChange={() => setUseSavedMethod(false)}
                        className="text-emerald-500 focus:ring-0"
                      />
                      <span className="text-xs text-gray-400 hover:text-gray-200">
                        Use a different Bank Account / Method
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* If not using saved method or no saved method exists */}
              {(!useSavedMethod || !savedMethod) && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Select Payout Method *
                    </label>
                    <select
                      value={reqMethod}
                      onChange={(e: any) => setReqMethod(e.target.value)}
                      className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="BANK_TRANSFER">Bank Account (Direct IMPS / NEFT)</option>
                      <option value="UPI">UPI (Google Pay, PhonePe, Paytm, BHIM)</option>
                      <option value="EASYPAISA">Easypaisa</option>
                      <option value="JAZZCASH">JazzCash</option>
                      <option value="PAYPAL">PayPal</option>
                      <option value="CRYPTO_USDT">USDT (TRC20 Network)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={reqHolder}
                      onChange={(e) => setReqHolder(e.target.value)}
                      placeholder="Account Holder Full Name"
                      className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {reqMethod === 'BANK_TRANSFER' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={reqBankName}
                          onChange={(e) => setReqBankName(e.target.value)}
                          placeholder="e.g. State Bank of India, HDFC Bank"
                          className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                            Account Number *
                          </label>
                          <input
                            type="password"
                            required
                            value={reqAccNumber}
                            onChange={(e) => setReqAccNumber(e.target.value)}
                            placeholder="Account Number"
                            className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                            Confirm A/C Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={reqConfirmAccNumber}
                            onChange={(e) => setReqConfirmAccNumber(e.target.value)}
                            placeholder="Re-enter A/C"
                            className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                          IFSC Code / SWIFT *
                        </label>
                        <input
                          type="text"
                          required
                          value={reqIfsc}
                          onChange={(e) => setReqIfsc(e.target.value.toUpperCase())}
                          placeholder="e.g. SBIN0001234"
                          className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                        />
                      </div>
                    </div>
                  )}

                  {reqMethod === 'UPI' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        UPI ID (e.g. name@okhdfcbank) *
                      </label>
                      <input
                        type="text"
                        required
                        value={reqUpiId}
                        onChange={(e) => setReqUpiId(e.target.value)}
                        placeholder="yourname@paytm or 9876543210@ybl"
                        className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  )}

                  {(reqMethod === 'EASYPAISA' || reqMethod === 'JAZZCASH') && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        {reqMethod} Mobile Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={reqWalletNumber}
                        onChange={(e) => setReqWalletNumber(e.target.value)}
                        placeholder="03001234567"
                        className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  )}

                  {reqMethod === 'PAYPAL' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        PayPal Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={reqPaypalEmail}
                        onChange={(e) => setReqPaypalEmail(e.target.value)}
                        placeholder="youremail@domain.com"
                        className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {reqMethod === 'CRYPTO_USDT' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        USDT TRC20 Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={reqUsdtAddress}
                        onChange={(e) => setReqUsdtAddress(e.target.value)}
                        placeholder="TLyqzVxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={(e) => setSaveAsDefault(e.target.checked)}
                      className="rounded text-emerald-500 bg-gray-900 border-gray-700 focus:ring-0"
                    />
                    <span className="text-xs text-gray-300">
                      Save this bank account for faster future payouts
                    </span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Notes / Reference Memo (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional memo or payout instruction"
                  className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E2638]">
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawals History Table */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#232D3F]">
          <h3 className="text-base font-bold text-white mb-1">Disbursement History</h3>
          <p className="text-xs text-gray-400">
            Audit trail of all requested and disbursed earnings transfers.
          </p>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No withdrawal requests yet.</p>
            <p className="text-gray-500 text-[11px] mt-1">
              Once your balance reaches ${minWithdrawal.toFixed(2)}, click &apos;Request Payout&apos;
              above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D121C] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#232D3F]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Reference ID</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Details</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Requested At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638] text-gray-300">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#1E2638]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      #{w.id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {formatCurrency(w.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1D2638] text-gray-200">
                        {w.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-300 max-w-[220px] truncate" title={w.paymentDetails}>
                      {w.paymentDetails}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(w.status)}</td>
                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {formatDateTime(w.createdAt)}
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
