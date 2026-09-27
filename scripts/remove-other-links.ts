import prisma from '../src/lib/prisma';

const USER_SMARTLINK = 'https://missiondifferentyawn.com/fpfr463rs?key=3140b2ffd6dd3b01612eba7863e3dd71';

async function cleanupOtherLinks() {
  console.log('\n🧹 Removing temporary test links and ensuring only clean Smartlinks remain...');

  try {
    // 1. Remove live-test-* links
    const deleted = await prisma.link.deleteMany({
      where: {
        slug: {
          startsWith: 'live-test-',
        },
      },
    });

    console.log(`🗑️ Removed ${deleted.count} temporary test links.`);

    // 2. Ensure all remaining links have the exact Smartlink URL
    await prisma.link.updateMany({
      data: {
        destinationUrl: USER_SMARTLINK,
        status: 'ACTIVE',
      },
    });

    // 3. List remaining links
    const links = await prisma.link.findMany({
      select: {
        name: true,
        slug: true,
        destinationUrl: true,
        status: true,
      },
    });

    console.log(`\n✅ Only ${links.length} active links remain in the system:`);
    links.forEach((l) => console.log(`• /go/${l.slug} -> ${l.destinationUrl}`));
  } catch (err: any) {
    console.error('Error cleaning up links:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOtherLinks();
