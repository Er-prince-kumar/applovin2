'use client';

import React from 'react';
import { validatePassword } from '@/lib/password';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  showDetails = true,
}: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null;
  }

  const {
    isValid,
    hasLength,
    hasLetter,
    hasNumber,
    hasSpecial,
    strengthScore,
    strengthLabel,
    strengthColor,
  } = validatePassword(password);

  const rules = [
    { label: 'At least 8 characters', met: hasLength },
    { label: 'Letters (a-z, A-Z)', met: hasLetter },
    { label: 'Numbers (0-9)', met: hasNumber },
    { label: 'Special character (!@#$%^&*)', met: hasSpecial },
  ];

  return (
    <div className="mt-2.5 p-3 rounded-xl bg-[#0D121C] border border-[#1E2638] space-y-2.5 animate-in fade-in duration-200">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-gray-400 font-medium">Password Strength:</span>
          <span
            className={`font-bold uppercase tracking-wider text-[10px] ${
              strengthScore === 4
                ? 'text-emerald-400'
                : strengthScore === 3
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {strengthLabel}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                step <= strengthScore ? strengthColor : 'bg-[#1D2636]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rules Checklist */}
      {showDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-[#1C2433]">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                rule.met ? 'text-emerald-400 font-medium' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                  rule.met
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {rule.met ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="w-1 h-1 rounded-full bg-gray-500" />}
              </div>
              <span className="truncate">{rule.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
