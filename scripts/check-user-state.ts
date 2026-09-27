import prisma from '../src/lib/prisma';

async function checkDetails() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      availableBalance: true,
      lifetimeEarnings: true,
      payoutDetails: true,
    },
  });

  console.log(JSON.stringify(users, null, 2));

  const earnings = await prisma.earning.findMany({ take: 10 });
  console.log('Sample Earnings count:', earnings.length);

  const transactions = await prisma.transaction.findMany({ take: 10 });
  console.log('Sample Transactions count:', transactions.length);

  await prisma.$disconnect();
}

checkDetails();
