import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const clicks = await prisma.clickEvent.findMany({
      where,
      include: {
        link: {
          select: {
            id: true,
            name: true,
            slug: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    });

    const [validCount, suspiciousCount, invalidCount] = await Promise.all([
      prisma.clickEvent.count({ where: { status: 'VALID' } }),
      prisma.clickEvent.count({ where: { status: 'SUSPICIOUS' } }),
      prisma.clickEvent.count({ where: { status: 'INVALID' } }),
    ]);

    return NextResponse.json({
      clicks,
      counts: {
        valid: validCount,
        suspicious: suspiciousCount,
        invalid: invalidCount,
        total: validCount + suspiciousCount + invalidCount,
      },
    });
  } catch (error) {
    console.error('Error in admin traffic API:', error);
    return NextResponse.json({ error: 'Unauthorized or forbidden' }, { status: 403 });
  }
}
