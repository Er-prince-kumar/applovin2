import prisma from '../src/lib/prisma';

async function showAllLinks() {
  console.log('\n======================================================');
  console.log('🔗 CURRENT LINKEARN SMARTLINKS & DESTINATIONS');
  console.log('======================================================\n');

  try {
    const links = await prisma.link.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        destinationUrl: true,
        status: true,
        totalClicks: true,
        earnings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Total Active Links: ${links.length}\n`);

    const tableData = links.map((l, i) => ({
      '#': i + 1,
      Name: l.name,
      Slug: l.slug,
      'Direct Path': `/go/${l.slug}`,
      'Destination URL (Ad / Smartlink)': l.destinationUrl,
      Status: l.status,
      Clicks: l.totalClicks,
      Earnings: `$${l.earnings.toFixed(2)}`,
    }));

    console.table(tableData);
  } catch (err: any) {
    console.error('Error fetching links:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

showAllLinks();
