import prisma from '../src/lib/prisma';
import { savePayoutBackup } from '../src/lib/payout-storage';

async function syncAllUserPayouts() {
  console.log('🔄 Backing up all users\' bank accounts into permanent data/payout-methods.json...');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      payoutDetails: true,
    },
  });

  let syncedCount = 0;
  for (const u of users) {
    if (u.payoutDetails) {
      try {
        const parsed = JSON.parse(u.payoutDetails);
        savePayoutBackup(u.id, u.email, parsed);
        console.log(`✅ Backed up bank account for ${u.name} (${u.email}):`, parsed.type, parsed.accountHolder);
        syncedCount++;
      } catch (e: any) {
        console.error(`Error parsing payout for ${u.email}:`, e.message);
      }
    }
  }

  console.log(`\n🎉 Permanent backup complete! Total backed up accounts: ${syncedCount}`);
  await prisma.$disconnect();
}

syncAllUserPayouts();
