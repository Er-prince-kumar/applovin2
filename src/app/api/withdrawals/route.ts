import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { savePayoutBackup, ensurePayoutDetailsPersisted } from '@/lib/payout-storage';
import { saveBalanceBackup } from '@/lib/earning-storage';

const withdrawalRequestSchema = z.object({
  amount: z.number().positive('Withdrawal amount must be greater than 0'),
  paymentMethod: z.enum([
    'BANK_TRANSFER',
    'UPI',
    'WIRE_TRANSFER',
    'PAYPAL',
    'CRYPTO_USDT',
    'PAYONEER',
    'EASYPAISA',
    'JAZZCASH',
  ]),
  paymentDetails: z.string().min(3, 'Please provide valid payout details'),
  saveAsDefault: z.boolean().optional().nullable(),
  structuredDetails: z.record(z.string(), z.any()).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [withdrawals, setting, userData] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.platformSetting.findUnique({
        where: { key: 'MIN_WITHDRAWAL_AMOUNT' },
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { payoutDetails: true },
      }),
    ]);

    const minAmount = setting ? parseFloat(setting.value) : 10.0;
    const rawDetails = await ensurePayoutDetailsPersisted(
      user.id,
      user.email,
      userData?.payoutDetails || null
    );
    const parsedPayoutDetails = (() => {
      if (!rawDetails) return null;
      try {
        const obj = JSON.parse(rawDetails);
        return typeof obj === 'object' && obj !== null ? obj : null;
      } catch {
        return null;
      }
    })();

    return NextResponse.json({
      withdrawals,
      minWithdrawal: minAmount,
      savedPayoutMethod: parsedPayoutDetails,
      balances: {
        available: user.availableBalance,
        pending: user.pendingBalance,
        lifetime: user.lifetimeEarnings,
        totalWithdrawn: user.totalWithdrawn,
      },
    });
  } catch (error) {
    console.error('Error retrieving withdrawals:', error);
    return NextResponse.json({ error: 'Failed to fetch withdrawal records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your account is currently restricted from submitting payouts' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = withdrawalRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid payout request parameters' },
        { status: 400 }
      );
    }

    const { amount, paymentMethod, paymentDetails, saveAsDefault, structuredDetails, notes } = result.data;

    // Check minimum threshold
    const minSetting = await prisma.platformSetting.findUnique({
      where: { key: 'MIN_WITHDRAWAL_AMOUNT' },
    });
    const minWithdrawal = minSetting ? parseFloat(minSetting.value) : 10.0;

    if (amount < minWithdrawal) {
      return NextResponse.json(
        { error: `The minimum withdrawal amount is $${minWithdrawal.toFixed(2)}` },
        { status: 400 }
      );
    }

    if (amount > user.availableBalance) {
      return NextResponse.json(
        {
          error: `Insufficient available balance ($${user.availableBalance.toFixed(
            2
          )}). You requested $${amount.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Mask sensitive details if bank
    let sanitizedDetails = paymentDetails.trim();

    const effectiveStructuredDetails = structuredDetails || {
      type: paymentMethod,
      accountHolder: user.name || 'Verified User',
      ...(paymentMethod === 'UPI' ? { upiId: sanitizedDetails } : {}),
      ...(paymentMethod === 'BANK_TRANSFER' ? { bankName: 'Bank', accountNumber: sanitizedDetails } : {}),
      ...(paymentMethod === 'PAYPAL' ? { paypalEmail: sanitizedDetails } : {}),
      ...(paymentMethod === 'CRYPTO_USDT' ? { usdtAddress: sanitizedDetails } : {}),
      ...(paymentMethod === 'EASYPAISA' || paymentMethod === 'JAZZCASH' ? { walletNumber: sanitizedDetails } : {}),
    };

    // Atomic transaction: adjust balances, create withdrawal, create transaction
    const txResult = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          availableBalance: { decrement: amount },
          pendingBalance: { increment: amount },
          ...(saveAsDefault && effectiveStructuredDetails
            ? { payoutDetails: JSON.stringify(effectiveStructuredDetails) }
            : {}),
        },
      });

      const newWithdrawal = await tx.withdrawal.create({
        data: {
          userId: user.id,
          amount,
          paymentMethod,
          paymentDetails: sanitizedDetails,
          notes: notes?.trim() || null,
          status: 'PENDING',
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: -amount,
          type: 'WITHDRAWAL',
          balanceAfter: updatedUser.availableBalance,
          referenceId: newWithdrawal.id,
          description: `Withdrawal request #${newWithdrawal.id.substring(0, 8)} (${paymentMethod})`,
        },
      });

      return {
        withdrawal: newWithdrawal,
        newBalance: updatedUser.availableBalance,
        newPending: updatedUser.pendingBalance,
        lifetime: updatedUser.lifetimeEarnings,
      };
    });

    if (saveAsDefault && effectiveStructuredDetails) {
      savePayoutBackup(user.id, user.email, effectiveStructuredDetails);
    }

    // Persist decremented balance to permanent backup
    saveBalanceBackup(user.id, user.email, {
      availableBalance: txResult.newBalance,
      pendingBalance: txResult.newPending,
      lifetimeEarnings: txResult.lifetime,
    });

    const response = NextResponse.json(
      {
        success: true,
        withdrawal: txResult.withdrawal,
        newBalance: txResult.newBalance,
        message: 'Withdrawal requested successfully. An administrator will review your payout.',
      },
      { status: 201 }
    );

    // Update permanent cookie with new balance
    response.cookies.set(`linkearn_bal_${user.id}`, JSON.stringify({
      availableBalance: txResult.newBalance,
      lifetimeEarnings: txResult.lifetime,
      updatedAt: Date.now(),
    }), {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error submitting withdrawal:', error);
    return NextResponse.json({ error: 'Failed to process payout request' }, { status: 500 });
  }
}
