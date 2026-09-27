import prisma from '../src/lib/prisma';

const SMARTLINK_URL = 'https://missiondifferentyawn.com/fpfr463rs?key=3140b2ffd6dd3b01612eba7863e3dd71';

async function assignLinksToPrince() {
  const prince = await prisma.user.findUnique({
    where: { email: 'princebxr2000@gmail.com' },
  });

  if (!prince) {
    console.error('Prince Kumar not found');
    return;
  }

  // Assign all current smartlinks to Prince Kumar
  const updated = await prisma.link.updateMany({
    data: {
      userId: prince.id,
      destinationUrl: SMARTLINK_URL,
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Assigned ${updated.count} links directly to Prince Kumar (${prince.email})!`);

  const links = await prisma.link.findMany({
    where: { userId: prince.id },
    select: { name: true, slug: true, destinationUrl: true },
  });

  console.log('\nPrince Kumar Links:');
  links.forEach((l) => console.log(`• http://localhost:3000/go/${l.slug}`));

  await prisma.$disconnect();
}

assignLinksToPrince();
