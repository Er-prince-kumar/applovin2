import prisma from '../src/lib/prisma';

async function syncPrinceEarnings() {
  console.log('🔄 Checking earnings vs user balance for Prince Kumar...');

  const prince = await prisma.user.findUnique({
    where: { email: 'princebxr2000@gmail.com' },
    include: {
      links: true,
      earnings: true,
      withdrawals: true,
    },
  });

  if (!prince) throw new Error('Prince not found');

  // 1. Calculate sum of earnings on links owned by Prince
  const linkEarningsSum = prince.links.reduce((acc, l) => acc + (l.earnings || 0), 0);
  console.log(`Prince links count: ${prince.links.length}, Total Link Earnings: $${linkEarningsSum.toFixed(2)}`);

  // 2. Calculate task/ad rewards owned by Prince
  const taskEarningsSum = prince.earnings
    .filter(e => !e.linkId)
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  console.log(`Prince Task Earnings: $${taskEarningsSum.toFixed(2)}`);

  // 3. Reassign any Earning records linked to Prince's links
  const princeLinkIds = prince.links.map(l => l.id);
  const reassignedEarnings = await prisma.earning.updateMany({
    where: {
      linkId: { in: princeLinkIds },
      userId: { not: prince.id },
    },
    data: {
      userId: prince.id,
    },
  });
  console.log(`Reassigned ${reassignedEarnings.count} existing link Earning records to Prince.`);

  // 4. Calculate total verified yield
  const totalYield = Number((linkEarningsSum + taskEarningsSum).toFixed(2));
  const totalWithdrawn = prince.withdrawals
    .filter(w => w.status === 'APPROVED')
    .reduce((acc, w) => acc + w.amount, 0);
  const pendingAmount = prince.withdrawals
    .filter(w => w.status === 'PENDING' || w.status === 'PROCESSING')
    .reduce((acc, w) => acc + w.amount, 0);

  const correctAvailable = Number((totalYield - totalWithdrawn - pendingAmount).toFixed(2));

  console.log(`\nBalance Calculation for Prince:`);
  console.log(`• Gross Lifetime Earnings: $${totalYield}`);
  console.log(`• Total Withdrawn: $${totalWithdrawn}`);
  console.log(`• Pending Review: $${pendingAmount}`);
  console.log(`• Correct Available Balance: $${correctAvailable}`);
  console.log(`• Previous DB Available Balance: $${prince.availableBalance}`);

  // 5. Update Prince's User record
  const updated = await prisma.user.update({
    where: { id: prince.id },
    data: {
      availableBalance: correctAvailable,
      lifetimeEarnings: totalYield,
      pendingBalance: pendingAmount,
      totalWithdrawn: totalWithdrawn,
    },
  });

  console.log(`\n✅ Successfully updated Prince Kumar in dev.db!`);
  console.log(`• New availableBalance: $${updated.availableBalance}`);
  console.log(`• New lifetimeEarnings: $${updated.lifetimeEarnings}`);

  await prisma.$disconnect();
}

syncPrinceEarnings().catch(console.error);
