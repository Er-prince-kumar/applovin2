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

  const prince = await prisma.user.findUnique({
    where: { email: 'princebxr2000@gmail.com' },
    include: {
      earnings: true,
      transactions: true,
      links: {
        include: {
          clicks: true,
        },
      },
    },
  });

  console.log('Prince details:');
  console.log('Available balance:', prince?.availableBalance);
  console.log('Lifetime earnings:', prince?.lifetimeEarnings);

  const allEarnings = await prisma.earning.findMany({
    include: { user: { select: { email: true } }, link: { select: { slug: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  console.log('Recent 20 Earnings:', allEarnings.map(e => ({
    user: e.user?.email,
    slug: e.link?.slug,
    amount: e.amount,
    type: e.type,
    desc: e.description,
    date: e.createdAt,
  })));

  const allClickEvents = await prisma.clickEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { link: { select: { slug: true, user: { select: { email: true } } } } },
  });
  console.log('Recent 10 ClickEvents:', allClickEvents.map(c => ({
    slug: c.link?.slug,
    owner: c.link?.user?.email,
    status: c.status,
    fraudReason: c.fraudReason,
    date: c.createdAt,
  })));

  // Total earnings per user
  const earningsSumByUser = await prisma.earning.groupBy({
    by: ['userId'],
    _sum: { amount: true },
    _count: { id: true },
  });
  console.log('Earnings sum by user:', earningsSumByUser);

  const links = await prisma.link.findMany({
    where: { user: { email: 'princebxr2000@gmail.com' } },
    include: { campaign: true },
  });
  console.log('PRINCE LINKS CAMPAIGNS:', links.map(l => ({
    slug: l.slug,
    campaignId: l.campaignId,
    campaignName: l.campaign?.name,
    campaignRate: l.campaign?.rate,
    campaignModel: l.campaign?.model,
    earnings: l.earnings,
    totalClicks: l.totalClicks,
  })));

  await prisma.$disconnect();
}

checkDetails();
