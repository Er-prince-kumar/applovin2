import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const payoutMethodSchema = z.object({
  type: z.enum([
    'BANK_TRANSFER',
    'UPI',
    'WIRE_TRANSFER',
    'PAYPAL',
    'CRYPTO_USDT',
    'PAYONEER',
    'EASYPAISA',
    'JAZZCASH',
  ]),
  accountHolder: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  ifscCode: z.string().optional().nullable(),
  accountType: z.string().optional().nullable(),
  upiId: z.string().optional().nullable(),
  walletNumber: z.string().optional().nullable(),
  paypalEmail: z.string().optional().nullable(),
  usdtAddress: z.string().optional().nullable(),
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { payoutDetails: true },
    });

    const parsed = (() => {
      if (!userData?.payoutDetails) return null;
      try {
        const obj = JSON.parse(userData.payoutDetails);
        return typeof obj === 'object' && obj !== null ? obj : null;
      } catch {
        return null;
      }
    })();

    return NextResponse.json({ payoutDetails: parsed });
  } catch (error) {
    console.error('Error fetching payout method:', error);
    return NextResponse.json({ error: 'Failed to fetch payout details' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = payoutMethodSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid bank account parameters' },
        { status: 400 }
      );
    }

    const payload = {
      ...result.data,
      updatedAt: new Date().toISOString(),
    };

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { payoutDetails: JSON.stringify(payload) },
      select: { id: true, payoutDetails: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Bank account / Payout details saved successfully!',
      payoutDetails: payload,
    });
  } catch (error) {
    console.error('Error saving payout details:', error);
    return NextResponse.json({ error: 'Failed to save payout details' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { payoutDetails: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Bank account unlinked successfully',
    });
  } catch (error) {
    console.error('Error deleting payout details:', error);
    return NextResponse.json({ error: 'Failed to unlink bank details' }, { status: 500 });
  }
}
