import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const campaignSchema = z.object({
  name: z.string().min(2, 'Campaign name is required'),
  description: z.string().optional().nullable(),
  model: z.enum(['CPC', 'CPM', 'CPA']),
  rate: z.number().positive('Rate must be greater than zero'),
  category: z.string().default('General'),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']).default('ACTIVE'),
});

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: {
          select: { links: true, earnings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error in campaigns GET:', error);
    return NextResponse.json({ error: 'Failed to retrieve campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const result = campaignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid campaign parameters' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: result.data,
    });

    await prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: 'CAMPAIGN_CREATE',
        targetType: 'CAMPAIGN',
        targetId: campaign.id,
        details: `Created campaign "${campaign.name}" (${campaign.model} @ $${campaign.rate})`,
      },
    });

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data,
    });

    await prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: 'CAMPAIGN_UPDATE',
        targetType: 'CAMPAIGN',
        targetId: id,
        details: `Updated campaign ${id} fields: ${Object.keys(data).join(', ')}`,
      },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}
