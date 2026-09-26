import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const rewardRequestSchema = z.object({
  taskType: z.enum([
    'REWARDED_VIDEO',
    'INTERSTITIAL',
    'AUTO_IMPRESSION',
    'BANNER',
    'LUCKY_SPIN',
    'SCRATCH_CARD',
  ]),
  durationSeconds: z.number().min(0),
  adNetwork: z.string().optional().default('AppLovin MAX'),
});

// Reward amounts in USD
const REWARD_RATES: Record<string, number> = {
  REWARDED_VIDEO: 0.05, // $0.05 per 30-sec rewarded video
  INTERSTITIAL: 0.02,   // $0.02 per interstitial popup
  AUTO_IMPRESSION: 0.008, // $0.008 per auto-impression cycle
  BANNER: 0.005,       // $0.005 per banner view
};

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to claim ad rewards' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is not eligible for ad task rewards' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = rewardRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { taskType, durationSeconds, adNetwork } = parsed.data;

    // Minimum duration checks to ensure ad was actually watched
    if (taskType === 'REWARDED_VIDEO' && durationSeconds < 15) {
      return NextResponse.json(
        { error: 'You must watch the full rewarded video (minimum 15 seconds) to claim the reward' },
        { status: 400 }
      );
    }

    // Determine reward amount
    let rewardAmount = 0.01;
    if (taskType === 'LUCKY_SPIN') {
      // Random spin rewards from $0.02 to $0.25
      const spinPrizes = [0.02, 0.03, 0.05, 0.08, 0.10, 0.15, 0.20, 0.25];
      rewardAmount = spinPrizes[Math.floor(Math.random() * spinPrizes.length)];
    } else if (taskType === 'SCRATCH_CARD') {
      const scratchPrizes = [0.02, 0.04, 0.06, 0.08, 0.10, 0.12];
      rewardAmount = scratchPrizes[Math.floor(Math.random() * scratchPrizes.length)];
    } else {
      rewardAmount = REWARD_RATES[taskType] || 0.01;
    }

    // Execute atomic balance update
    const result = await prisma.$transaction(async (tx) => {
      // 1. Credit user balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          availableBalance: { increment: rewardAmount },
          lifetimeEarnings: { increment: rewardAmount },
        },
      });

      // 2. Log transaction in ledger
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'EARNING',
          amount: rewardAmount,
          balanceAfter: updatedUser.availableBalance,
          description: `Reward for watching ${taskType.replace(/_/g, ' ')} ad via ${adNetwork}`,
        },
      });

      // 3. Referral bonus (5% lifetime commission to sponsor if user was referred)
      if (user.referredById) {
        const referralCommission = Number((rewardAmount * 0.05).toFixed(4));
        if (referralCommission > 0) {
          const sponsor = await tx.user.update({
            where: { id: user.referredById },
            data: {
              availableBalance: { increment: referralCommission },
              lifetimeEarnings: { increment: referralCommission },
            },
          });

          await tx.transaction.create({
            data: {
              userId: user.referredById,
              type: 'REFERRAL_BONUS',
              amount: referralCommission,
              balanceAfter: sponsor.availableBalance,
              description: `5% referral commission from ${user.name} ad task reward`,
            },
          });
        }
      }

      return {
        newBalance: updatedUser.availableBalance,
        rewardAmount,
        transactionId: transaction.id,
      };
    });

    return NextResponse.json({
      success: true,
      message: `🎉 Reward claimed: +$${rewardAmount.toFixed(3)} added to your wallet!`,
      rewardAmount: result.rewardAmount,
      availableBalance: result.newBalance,
      taskType,
    });
  } catch (error) {
    console.error('Error claiming ad reward:', error);
    return NextResponse.json({ error: 'Failed to process ad task reward' }, { status: 500 });
  }
}
