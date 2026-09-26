'use client';

import React, { useState } from 'react';
import { User, Mail, Lock, ShieldCheck, Key, Check, AlertCircle, Save, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { validatePassword } from '@/lib/password';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';

interface ProfileViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    referralCode: string;
    createdAt: string | Date;
  };
}

export default function ProfileView({ user }: ProfileViewProps) {
  const { toast } = useToast();
  const [name, setName] = useState(user.name);
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to update name');
      toast('Profile name updated!', 'success');
    } catch {
      toast('Failed to update name', 'error');
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassError(null);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPassError(`New password must include: ${validation.errors.join(', ')}`);
      return;
    }

    setSavingPass(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      toast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Error updating password');
    } finally {
      setSavingPass(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Account Overview Card */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2638]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-gray-950 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                <span>{user.email}</span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-mono font-medium">Ref: {user.referralCode}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Publisher
            </span>
          </div>
        </div>

        {/* Name Form */}
        <form onSubmit={handleUpdateName} className="pt-6 space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Registered Email (Immutable)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-[#0D121C]/50 border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Contact administration if you require an email change.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingName || name === user.name}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            <span>{savingName ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <Key className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Security & Password</h3>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Update your password regularly to protect your earnings ledger and payout authorizations.
        </p>

        {passError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showCurrentPass ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                title={showCurrentPass ? 'Hide password' : 'Show password'}
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              New Password (Combination Required)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                title={showNewPass ? 'Hide password' : 'Show password'}
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Real-time strength meter */}
            <PasswordStrengthIndicator password={newPassword} showDetails={true} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showConfirmPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                title={showConfirmPass ? 'Hide password' : 'Show password'}
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPass}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{savingPass ? 'Updating...' : 'Change Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
