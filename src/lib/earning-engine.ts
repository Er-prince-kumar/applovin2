import prisma from './prisma';

export interface EarningProcessingResult {
  amount: number;
  earningId?: string;
  referralBonus?: number;
  model: string;
}

export async function processEarningForClick({
  linkId,
  clickEventId,
}: {
  linkId: string;
  clickEventId: string;
}): Promise<EarningProcessingResult | null> {
  const link = await prisma.link.findUnique({
    where: { id: linkId },
    include: {
      campaign: true,
      user: {
        select: {
          id: true,
          status: true,
          referredById: true,
        },
      },
    },
  });

  if (!link || !link.user || link.user.status !== 'ACTIVE') {
    return null;
  }

  // Determine campaign model and rate
  const campaign = link.campaign;
  const model = campaign?.model || 'CPC';
  let earningAmount = 0;

  if (model === 'CPC') {
    earningAmount = campaign?.rate ?? 0.05;
  } else if (model === 'CPM') {
    // CPM rate per 1,000 valid impressions
    const cpmRate = campaign?.rate ?? 2.50;
    earningAmount = Number((cpmRate / 1000).toFixed(5));
  } else if (model === 'CPA') {
    // CPA earnings occur upon approved conversion events, not pure clicks
    earningAmount = 0;
  }

  // Update link statistics
  await prisma.link.update({
    where: { id: link.id },
    data: {
      totalClicks: { increment: 1 },
      validClicks: { increment: 1 },
      earnings: { increment: earningAmount },
    },
  });

  if (earningAmount <= 0) {
    return { amount: 0, model };
  }

  // 1. Create publisher Earning record
  const earningRecord = await prisma.earning.create({
    data: {
      userId: link.userId,
      linkId: link.id,
      campaignId: campaign?.id,
      clickEventId,
      amount: earningAmount,
      type: model,
      description: `${model} credit for verified traffic on "${link.name}"`,
    },
  });

  // 2. Update publisher User balance
  const updatedUser = await prisma.user.update({
    where: { id: link.userId },
    data: {
      availableBalance: { increment: earningAmount },
      lifetimeEarnings: { increment: earningAmount },
    },
  });

  // 3. Create immutable ledger Transaction
  await prisma.transaction.create({
    data: {
      userId: link.userId,
      amount: earningAmount,
      type: 'EARNING',
      balanceAfter: updatedUser.availableBalance,
      referenceId: earningRecord.id,
      description: `Traffic payout credit: ${model}`,
    },
  });

  // 4. Referral Commission Processing
  let referralBonus = 0;
  if (link.user.referredById && link.user.referredById !== link.userId) {
    try {
      // Fetch platform referral percentage
      const setting = await prisma.platformSetting.findUnique({
        where: { key: 'REFERRAL_COMMISSION_PERCENT' },
      });
      const commissionPercent = setting ? parseFloat(setting.value) : 5.0;
      const commissionRate = commissionPercent / 100;

      referralBonus = Number((earningAmount * commissionRate).toFixed(5));

      if (referralBonus > 0) {
        // Record referral earning
        const refEarning = await prisma.earning.create({
          data: {
            userId: link.user.referredById,
            linkId: link.id,
            amount: referralBonus,
            type: 'REFERRAL_BONUS',
            description: `${commissionPercent}% Tier 1 referral reward from affiliate traffic`,
          },
        });

        await prisma.referralEarning.create({
          data: {
            referrerId: link.user.referredById,
            referredUserId: link.userId,
            sourceEarningId: refEarning.id,
            commissionRate,
            amount: referralBonus,
          },
        });

        const updatedReferrer = await prisma.user.update({
          where: { id: link.user.referredById },
          data: {
            availableBalance: { increment: referralBonus },
            lifetimeEarnings: { increment: referralBonus },
          },
        });

        await prisma.transaction.create({
          data: {
            userId: link.user.referredById,
            amount: referralBonus,
            type: 'REFERRAL_BONUS',
            balanceAfter: updatedReferrer.availableBalance,
            referenceId: refEarning.id,
            description: `Referral commission credit`,
          },
        });
      }
    } catch (refErr) {
      console.error('Error processing referral bonus:', refErr);
    }
  }

  return {
    amount: earningAmount,
    earningId: earningRecord.id,
    referralBonus,
    model,
  };
}
