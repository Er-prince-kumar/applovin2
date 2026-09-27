import prisma from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function clearDummyBanks() {
  console.log('🧹 Clearing all dummy / test bank details...');

  // 1. Reset payoutDetails to null for all users in the SQLite database
  const res = await prisma.user.updateMany({
    data: {
      payoutDetails: null,
    },
  });

  console.log(`✅ Cleared payoutDetails for ${res.count} users in SQLite dev.db.`);

  // 2. Clear data/payout-methods.json
  const backupFile = path.resolve(process.cwd(), 'data', 'payout-methods.json');
  if (fs.existsSync(backupFile)) {
    fs.writeFileSync(backupFile, JSON.stringify({}, null, 2), 'utf-8');
    console.log('✅ Cleared data/payout-methods.json to empty {}.');
  }

  // 3. Verify
  const users = await prisma.user.findMany({
    select: { email: true, name: true, payoutDetails: true },
  });

  console.log('\nAll users current payout status:');
  users.forEach((u) => console.log(`• ${u.name} (${u.email}): ${u.payoutDetails || 'NO BANK LINKED (CLEAN)'}`));

  await prisma.$disconnect();
}

clearDummyBanks();
