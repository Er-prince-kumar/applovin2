import prisma from '../src/lib/prisma';

async function testRewardFlow() {
  const user = await prisma.user.findUnique({
    where: { email: 'princebxr2000@gmail.com' },
  });

  if (!user) {
    console.error('Prince not found');
    return;
  }

  const initialBal = user.availableBalance;
  console.log(`Prince initial balance: $${initialBal.toFixed(4)}`);

  const rewardAmount = 0.05; // 1 Rewarded Video
  const adNetwork = 'Adsterra Smartlink';
  const taskType = 'REWARDED_VIDEO';

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      availableBalance: { increment: rewardAmount },
      lifetimeEarnings: { increment: rewardAmount },
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'EARNING',
      amount: rewardAmount,
      balanceAfter: updatedUser.availableBalance,
      description: `Reward for watching ${taskType} ad via ${adNetwork}`,
    },
  });

  await prisma.earning.create({
    data: {
      userId: user.id,
      amount: rewardAmount,
      type: 'CPC',
      description: `Ad Task Reward: ${taskType} (${adNetwork})`,
    },
  });

  console.log(`Prince updated balance: $${updatedUser.availableBalance.toFixed(4)}`);

  // Verify aggregations for today and month
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayEarnings = await prisma.earning.aggregate({
    where: { userId: user.id, createdAt: { gte: startOfToday } },
    _sum: { amount: true },
  });

  console.log("Today's aggregated earnings for Prince:", todayEarnings._sum.amount);

  await prisma.$disconnect();
}

testRewardFlow();
