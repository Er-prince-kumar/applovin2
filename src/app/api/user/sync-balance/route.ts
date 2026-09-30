import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { saveBalanceBackup, getBalanceBackup } from '@/lib/earning-storage';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const clientBalance = typeof body.balance === 'number' ? body.balance : undefined;
    const clientLifetime = typeof body.lifetimeEarnings === 'number' ? body.lifetimeEarnings : undefined;
    const clientAdsToday = typeof body.adsWatchedToday === 'number' ? body.adsWatchedToday : undefined;

    const backup = getBalanceBackup(user.id, user.email);

    // Calculate maximum valid balance
    let targetBalance = user.availableBalance;
    if (backup && backup.availableBalance > targetBalance) {
      targetBalance = backup.availableBalance;
    }
    if (clientBalance !== undefined && clientBalance > targetBalance && clientBalance < 50000) {
      targetBalance = Number(clientBalance.toFixed(4));
    }

    let targetLifetime = Math.max(user.lifetimeEarnings, targetBalance);
    if (backup && backup.lifetimeEarnings > targetLifetime) {
      targetLifetime = backup.lifetimeEarnings;
    }
    if (clientLifetime !== undefined && clientLifetime > targetLifetime && clientLifetime < 50000) {
      targetLifetime = Number(clientLifetime.toFixed(4));
    }

    // Persist to database if writable
    try {
      if (targetBalance > user.availableBalance || targetLifetime > user.lifetimeEarnings) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            availableBalance: targetBalance,
            lifetimeEarnings: targetLifetime,
          },
        });
      }
    } catch (e) {
      // Ephemeral database fallback
    }

    // Persist to multi-tier backup
    saveBalanceBackup(user.id, user.email, {
      availableBalance: targetBalance,
      lifetimeEarnings: targetLifetime,
      adsWatchedToday: clientAdsToday,
    });

    const response = NextResponse.json({
      success: true,
      balance: targetBalance,
      lifetimeEarnings: targetLifetime,
    });

    // Set permanent 30-day cookie for instant SSR availability
    response.cookies.set(`linkearn_bal_${user.id}`, JSON.stringify({
      availableBalance: targetBalance,
      lifetimeEarnings: targetLifetime,
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
    console.error('Error syncing user balance:', error);
    return NextResponse.json({ error: 'Failed to sync balance' }, { status: 500 });
  }
}
