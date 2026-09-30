import prisma from '../src/lib/prisma';

async function cleanupOtherLinks() {
  console.log('\n🧹 Removing extra smartlinks and restoring clean standard link destinations...');

  try {
    // 1. Delete extra smartlink / test links
    const deleted = await prisma.link.deleteMany({
      where: {
        slug: {
          in: ['smartlink', 'ad', 'direct'],
        },
      },
    });

    console.log(`🗑️ Removed ${deleted.count} extra smartlinks.`);

    // 2. Restore standard clean destination URLs
    await prisma.link.updateMany({
      where: { slug: 'dev-tools' },
      data: { destinationUrl: 'https://github.com/trending', status: 'ACTIVE' },
    });
    await prisma.link.updateMany({
      where: { slug: 'gaming-benchmark' },
      data: { destinationUrl: 'https://ign.com', status: 'ACTIVE' },
    });
    await prisma.link.updateMany({
      where: { slug: 'smart-savings' },
      data: { destinationUrl: 'https://investopedia.com', status: 'ACTIVE' },
    });
    await prisma.link.updateMany({
      where: { slug: 'remote-work' },
      data: { destinationUrl: 'https://weworkremotely.com', status: 'ACTIVE' },
    });

    // 3. List remaining links
    const links = await prisma.link.findMany({
      select: {
        name: true,
        slug: true,
        destinationUrl: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`\n✅ Only ${links.length} clean links remain in the system:`);
    links.forEach((l) => console.log(`• /go/${l.slug} -> ${l.destinationUrl}`));
  } catch (err: any) {
    console.error('Error cleaning up links:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOtherLinks();

