import prisma from '../src/lib/prisma';
import { saveBalanceBackup, getBalanceBackup, ensureBalancePersisted } from '../src/lib/earning-storage';
import { getCurrentUser } from '../src/lib/auth';

async function runPermanenceTests() {
  console.log('\n====================================================');
  console.log('🧪 TESTING EARNING PERMANENCE & ZERO-RESET PREVENTION');
  console.log('====================================================\n');

  // Find a test user or Prince Kumar
  const user = await prisma.user.findFirst({
    where: { email: { in: ['princebxr2000@gmail.com', 'publisher@linkearn.com'] } },
  });

  if (!user) {
    console.error('❌ No test user found');
    process.exit(1);
  }

  console.log(`👤 Testing with user: ${user.name} (${user.email})`);
  console.log(`   Initial DB availableBalance: $${user.availableBalance}`);
  console.log(`   Initial DB lifetimeEarnings: $${user.lifetimeEarnings}`);

  // Test 1: Save balance to multi-tier backup
  console.log('\n--- TEST 1: Multi-Tier Persistent Backup ---');
  const testBalance = 5.25;
  const testLifetime = 12.50;
  saveBalanceBackup(user.id, user.email, {
    availableBalance: testBalance,
    lifetimeEarnings: testLifetime,
    adsWatchedToday: 7,
  });

  const retrieved = getBalanceBackup(user.id, user.email);
  if (!retrieved || retrieved.availableBalance !== testBalance || retrieved.adsWatchedToday !== 7) {
    throw new Error(`Failed to retrieve backup correctly: ${JSON.stringify(retrieved)}`);
  }
  console.log('✅ TEST 1 PASSED: Multi-tier storage successfully saved and verified backup.');

  // Test 2: Simulate Database reset to 0 (e.g. cold start / new lambda / git pull)
  console.log('\n--- TEST 2: Self-Healing Against DB 0-Reset ---');
  await prisma.user.update({
    where: { id: user.id },
    data: { availableBalance: 0, lifetimeEarnings: 0 },
  });

  const zeroDbUser = await prisma.user.findUnique({ where: { id: user.id } });
  console.log(`   Simulated DB Reset -> availableBalance is now: $${zeroDbUser?.availableBalance}`);

  // Call ensureBalancePersisted
  const healed = await ensureBalancePersisted(
    user.id,
    user.email,
    zeroDbUser?.availableBalance || 0,
    zeroDbUser?.lifetimeEarnings || 0
  );

  if (!healed || healed.availableBalance !== testBalance) {
    throw new Error(`Self-healing failed: expected $${testBalance}, got: ${JSON.stringify(healed)}`);
  }

  const restoredDbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (restoredDbUser?.availableBalance !== testBalance) {
    throw new Error(`DB was not updated with healed balance: ${restoredDbUser?.availableBalance}`);
  }
  console.log(`✅ TEST 2 PASSED: Self-healing detected $0 DB balance and restored to $${testBalance}!`);

  // Test 3: Daily Task Count Retention
  console.log('\n--- TEST 3: Daily Task Count Retention ---');
  const todayStr = new Date().toISOString().split('T')[0];
  if (retrieved.adsWatchedDate !== todayStr || retrieved.adsWatchedToday !== 7) {
    throw new Error(`Ads watched date or count mismatch: ${JSON.stringify(retrieved)}`);
  }
  console.log(`✅ TEST 3 PASSED: Daily ad count retained (${retrieved.adsWatchedToday} ads on ${todayStr})!`);

  console.log('\n====================================================');
  console.log('🎉 ALL EARNING PERMANENCE TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================\n');

  await prisma.$disconnect();
}

runPermanenceTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
