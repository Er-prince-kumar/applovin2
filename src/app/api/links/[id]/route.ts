import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const updateLinkSchema = z.object({
  name: z.string().min(2).optional(),
  destinationUrl: z.string().url().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  description: z.string().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const link = await prisma.link.findUnique({
      where: { id },
    });

    if (!link || (link.userId !== user.id && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Link not found or forbidden' }, { status: 404 });
    }

    const body = await request.json();
    const result = updateLinkSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
    }

    const updated = await prisma.link.update({
      where: { id },
      data: result.data,
      include: { campaign: true },
    });

    return NextResponse.json({ success: true, link: updated });
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const link = await prisma.link.findUnique({
      where: { id },
    });

    if (!link || (link.userId !== user.id && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Link not found or forbidden' }, { status: 404 });
    }

    await prisma.link.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
