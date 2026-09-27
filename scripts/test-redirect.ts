import prisma from '../src/lib/prisma';

async function testSlug(slug: string) {
  const link = await prisma.link.findUnique({
    where: { slug },
  });

  if (!link) {
    console.error(`❌ Link not found for slug: ${slug}`);
    return;
  }

  console.log(`✅ Slug [${slug}] redirects to -> ${link.destinationUrl}`);
}

async function run() {
  await testSlug('smartlink');
  await testSlug('ad');
  await testSlug('direct');
  await testSlug('dev-tools');
  await prisma.$disconnect();
}

run();
