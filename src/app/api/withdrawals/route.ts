import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const withdrawalRequestSchema = z.object({
  amount: z.number().positive('Withdrawal amount must be greater than 0'),
  paymentMethod: z.enum(['PAYPAL', 'WIRE_TRANSFER', 'CRYPTO_USDT', 'PAYONEER']),
  paymentDetails: z.string().min(3, 'Please provide valid payout details (e.g. email or wallet)'),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [withdrawals, setting] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.platformSetting.findUnique({
        where: { key: 'MIN_WITHDRAWAL_AMOUNT' },
      }),
    ]);

    const minAmount = setting ? parseFloat(setting.value) : 10.0;

    return NextResponse.json({
      withdrawals,
      minWithdrawal: minAmount,
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

    const { amount, paymentMethod, paymentDetails, notes } = result.data;

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

    // Atomic transaction: adjust balances, create withdrawal, create transaction
    const withdrawal = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          availableBalance: { decrement: amount },
          pendingBalance: { increment: amount },
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

      return newWithdrawal;
    });

    return NextResponse.json(
      {
        success: true,
        withdrawal,
        message: 'Withdrawal requested successfully. An administrator will review your payout.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting withdrawal:', error);
    return NextResponse.json({ error: 'Failed to process payout request' }, { status: 500 });
  }
}
