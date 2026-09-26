import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const createLinkSchema = z.object({
  name: z.string().min(2, 'Link name must be at least 2 characters'),
  destinationUrl: z.string().url('Please enter a valid destination URL (http:// or https://)'),
  campaignId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  slug: z
    .string()
    .min(3, 'Custom slug must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Slug can only contain letters, numbers, hyphens, and underscores')
    .optional()
    .nullable(),
  status: z.enum(['ACTIVE', 'PAUSED']).default('ACTIVE'),
});

function generateSlug(length = 7): string {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const whereClause: any = {
      userId: user.id,
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { destinationUrl: { contains: search } },
      ];
    }

    const links = await prisma.link.findMany({
      where: whereClause,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            model: true,
            rate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({ error: 'Failed to retrieve links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = createLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid link details' },
        { status: 400 }
      );
    }

    const { name, destinationUrl, campaignId, description, slug: customSlug, status } = result.data;

    // Determine final slug
    let finalSlug = customSlug?.trim();
    if (finalSlug) {
      const existing = await prisma.link.findUnique({
        where: { slug: finalSlug },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'This custom slug is already taken. Please choose another one.' },
          { status: 409 }
        );
      }
    } else {
      finalSlug = generateSlug();
      let exists = await prisma.link.findUnique({ where: { slug: finalSlug } });
      while (exists) {
        finalSlug = generateSlug();
        exists = await prisma.link.findUnique({ where: { slug: finalSlug } });
      }
    }

    // Default to first active campaign if none specified
    let targetCampaignId = campaignId;
    if (!targetCampaignId) {
      const defaultCampaign = await prisma.campaign.findFirst({
        where: { status: 'ACTIVE' },
      });
      targetCampaignId = defaultCampaign?.id || null;
    }

    const newLink = await prisma.link.create({
      data: {
        userId: user.id,
        name: name.trim(),
        destinationUrl: destinationUrl.trim(),
        campaignId: targetCampaignId,
        description: description?.trim() || null,
        slug: finalSlug,
        status: status || 'ACTIVE',
      },
      include: {
        campaign: true,
      },
    });

    return NextResponse.json({ success: true, link: newLink }, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Failed to create monetization link' }, { status: 500 });
  }
}
