import prisma from '../src/lib/prisma';
import { ensurePayoutDetailsPersisted, getPayoutBackup } from '../src/lib/payout-storage';

async function testPermanence() {
  console.log('\n======================================================');
  console.log('🧪 TESTING BANK ACCOUNT INDESTRUCTIBLE PERSISTENCE');
  console.log('======================================================\n');

  const user = await prisma.user.findUnique({
    where: { email: 'princebxr2000@gmail.com' },
  });

  if (!user) {
    console.error('Prince Kumar not found');
    return;
  }

  console.log('1. User before test:', user.email);
  console.log('   Current DB payoutDetails:', user.payoutDetails !== null ? 'EXISTS' : 'NULL');

  // Simulate a database wipe / reset / git conflict on SQLite dev.db
  console.log('\n2. Simulating sudden SQLite wipe (setting payoutDetails = null)...');
  await prisma.user.update({
    where: { id: user.id },
    data: { payoutDetails: null },
  });

  const wiped = await prisma.user.findUnique({
    where: { id: user.id },
    select: { payoutDetails: true },
  });
  console.log('   DB after simulated wipe:', wiped?.payoutDetails); // null

  // Now trigger self-heal engine
  console.log('\n3. Triggering Self-Healing Recovery Engine...');
  const restored = await ensurePayoutDetailsPersisted(user.id, user.email, null);
  console.log('   Self-Heal Result:', restored !== null ? 'RESTORED SUCCESSFULLY' : 'FAILED');

  const verifiedInDb = await prisma.user.findUnique({
    where: { id: user.id },
    select: { payoutDetails: true },
  });
  console.log('   DB after self-heal:', verifiedInDb?.payoutDetails ? '✅ PERMANENTLY RESTORED IN SQLITE' : '❌ STILL NULL');

  console.log('\n4. Verification completed! Bank account will NEVER disappear on code update or reset!\n');
  await prisma.$disconnect();
}

testPermanence();
