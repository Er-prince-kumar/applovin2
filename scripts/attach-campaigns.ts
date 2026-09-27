import prisma from '../src/lib/prisma';

async function attachCampaigns() {
  const defaultCampaign = await prisma.campaign.findFirst({
    where: { status: 'ACTIVE', model: 'CPC' },
  });

  if (!defaultCampaign) {
    console.error('No active CPC campaign found');
    return;
  }

  console.log(`Using default campaign: "${defaultCampaign.name}" (Rate: $${defaultCampaign.rate}, Model: ${defaultCampaign.model})`);

  const updated = await prisma.link.updateMany({
    where: {
      slug: { in: ['smartlink', 'ad', 'direct'] },
      campaignId: null,
    },
    data: {
      campaignId: defaultCampaign.id,
    },
  });

  console.log(`Updated ${updated.count} links with campaign.`);

  const links = await prisma.link.findMany({
    where: { slug: { in: ['smartlink', 'ad', 'direct'] } },
    include: { campaign: true },
  });

  links.forEach(l => {
    console.log(`• ${l.slug}: Campaign = ${l.campaign?.name} (Rate: $${l.campaign?.rate})`);
  });

  await prisma.$disconnect();
}

attachCampaigns().catch(console.error);
