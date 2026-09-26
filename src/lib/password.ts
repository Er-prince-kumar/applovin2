import { z } from 'zod';

export interface PasswordValidationResult {
  isValid: boolean;
  hasLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  strengthScore: number; // 0 to 4
  strengthLabel: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong';
  strengthColor: string;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  let strengthScore = 0;
  if (hasLength) strengthScore += 1;
  if (hasLetter) strengthScore += 1;
  if (hasNumber) strengthScore += 1;
  if (hasSpecial) strengthScore += 1;

  let strengthLabel: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' = 'Very Weak';
  let strengthColor = 'bg-red-500';

  if (strengthScore === 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
  } else if (strengthScore === 3) {
    strengthLabel = 'Moderate';
    strengthColor = 'bg-amber-500';
  } else if (strengthScore === 2) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-orange-500';
  } else {
    strengthLabel = 'Very Weak';
    strengthColor = 'bg-red-500';
  }

  const errors: string[] = [];
  if (!hasLength) errors.push('At least 8 characters long');
  if (!hasLetter) errors.push('At least one alphabet letter (a-z, A-Z)');
  if (!hasNumber) errors.push('At least one numeric digit (0-9)');
  if (!hasSpecial) errors.push('At least one special character (!@#$%^&* etc.)');

  return {
    isValid: strengthScore === 4,
    hasLength,
    hasLetter,
    hasNumber,
    hasSpecial,
    strengthScore,
    strengthLabel,
    strengthColor,
    errors,
  };
}

export const passwordComplexitySchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter (a-z, A-Z)')
  .regex(/[0-9]/, 'Password must contain at least one number (0-9)')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character (e.g. !@#$%^&*)');
