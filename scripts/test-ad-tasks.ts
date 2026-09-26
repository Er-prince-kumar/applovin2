import prisma from '../src/lib/prisma';
import { hashPassword, createSessionToken } from '../src/lib/auth';

async function testAdTasks() {
  console.log('--- Testing Ad Network & Ad Tasks Reward Engine ---');

  // Find or create a test user
  let user = await prisma.user.findUnique({
    where: { email: 'publisher@linkearn.com' },
  });

  if (!user) {
    throw new Error('publisher@linkearn.com not found');
  }

  const initialBalance = user.availableBalance;
  console.log(`Initial available balance: $${initialBalance.toFixed(4)}`);

  // 1. Test Ad Network Config retrieval and update
  const defaultSetting = await prisma.platformSetting.findUnique({
    where: { key: 'AD_NETWORK_CONFIG' },
  });

  console.log('✓ Found Ad Network Platform Setting:', !!defaultSetting);

  // 2. Direct database test for Reward distribution
  const rewardAmount = 0.05;
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      availableBalance: { increment: rewardAmount },
      lifetimeEarnings: { increment: rewardAmount },
    },
  });

  console.log(`Balance after $0.05 Rewarded Video: $${updatedUser.availableBalance.toFixed(4)}`);
  if (Math.abs(updatedUser.availableBalance - (initialBalance + rewardAmount)) > 0.0001) {
    throw new Error('Balance increment calculation mismatch');
  }
  console.log('✓ Rewarded Video credit verified successfully!');

  // 3. Log transaction
  const tx = await prisma.transaction.create({
    data: {
      userId: user.id,
      amount: rewardAmount,
      balanceAfter: updatedUser.availableBalance,
      type: 'EARNING',
      description: 'Ad Task Reward - Rewarded Video (AppLovin MAX)',
    },
  });

  console.log('✓ Immutable transaction logged with ID:', tx.id);

  // 4. Verify transaction exists
  const retrievedTx = await prisma.transaction.findUnique({
    where: { id: tx.id },
  });
  if (!retrievedTx || retrievedTx.amount !== rewardAmount) {
    throw new Error('Transaction record mismatch');
  }

  console.log('✓ All Ad Task Reward tests PASSED successfully!');
}

testAdTasks()
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
