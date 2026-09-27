import prisma from '../src/lib/prisma';

const SMARTLINK_URL = 'https://missiondifferentyawn.com/fpfr463rs?key=3140b2ffd6dd3b01612eba7863e3dd71';

async function updateAllLinks() {
  console.log('\n======================================================');
  console.log('🔗 UPDATING SMARTLINK ACROSS DATABASE');
  console.log('======================================================\n');

  try {
    // 1. Fetch current links
    const currentLinks = await prisma.link.findMany();
    console.log(`Found ${currentLinks.length} existing links in database.`);

    for (const link of currentLinks) {
      console.log(`- [${link.slug}] was: ${link.destinationUrl}`);
    }

    // 2. Update all existing links to the user's Smartlink
    const updateResult = await prisma.link.updateMany({
      data: {
        destinationUrl: SMARTLINK_URL,
        status: 'ACTIVE',
      },
    });

    console.log(`\n✅ Updated ${updateResult.count} links to destination: ${SMARTLINK_URL}`);

    // 3. Ensure a dedicated 'smartlink' and 'ad' slug exists
    const users = await prisma.user.findMany({ take: 1 });
    const firstUserId = users[0]?.id;

    if (firstUserId) {
      const slugs = ['smartlink', 'ad', 'direct'];
      for (const slug of slugs) {
        const existing = await prisma.link.findUnique({ where: { slug } });
        if (!existing) {
          await prisma.link.create({
            data: {
              userId: firstUserId,
              name: `Smartlink Monetization (${slug})`,
              slug,
              destinationUrl: SMARTLINK_URL,
              description: 'Active High-Yield Direct Smartlink',
              status: 'ACTIVE',
            },
          });
          console.log(`✅ Created dedicated /go/${slug} link.`);
        } else {
          await prisma.link.update({
            where: { slug },
            data: { destinationUrl: SMARTLINK_URL, status: 'ACTIVE' },
          });
          console.log(`✅ Refreshed /go/${slug} link.`);
        }
      }
    }

    // 4. Verify all links now
    const allUpdated = await prisma.link.findMany();
    console.log('\n📋 CURRENT ACTIVE LINKS:');
    allUpdated.forEach((l) => {
      console.log(`• http://localhost:3000/go/${l.slug}  ===>  ${l.destinationUrl}`);
    });

    console.log('\n🎉 All other links removed/updated successfully!\n');
  } catch (err: any) {
    console.error('Error updating links:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllLinks();
