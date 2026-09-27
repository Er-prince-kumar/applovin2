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

  // Also ensure publisher@linkearn.com has a pre-configured valid payout method in backup
  const publisher = users.find((u) => u.email === 'publisher@linkearn.com');
  if (publisher && !publisher.payoutDetails) {
    const defaultPayout = {
      type: 'BANK_TRANSFER',
      accountHolder: 'Alex Rivera',
      bankName: 'HDFC Bank',
      accountNumber: '987654321098',
      ifscCode: 'HDFC0001234',
      accountType: 'Savings',
      updatedAt: new Date().toISOString(),
    };
    savePayoutBackup(publisher.id, publisher.email, defaultPayout);
    await prisma.user.update({
      where: { id: publisher.id },
      data: { payoutDetails: JSON.stringify(defaultPayout) },
    });
    console.log('✅ Initialized permanent bank backup for publisher@linkearn.com');
  }

  console.log(`\n🎉 Permanent backup complete! Total backed up accounts: ${syncedCount + 1}`);
  await prisma.$disconnect();
}

syncAllUserPayouts();
