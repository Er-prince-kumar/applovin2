import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { referralCode: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        referralCode: true,
        availableBalance: true,
        pendingBalance: true,
        lifetimeEarnings: true,
        totalWithdrawn: true,
        createdAt: true,
        _count: {
          select: {
            links: true,
            referralRecords: true,
            withdrawals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Unauthorized or forbidden' }, { status: 403 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { userId, status, role } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(status ? { status } : {}),
        ...(role ? { role } : {}),
      },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: status === 'SUSPENDED' ? 'USER_SUSPEND' : 'USER_UPDATE',
        targetType: 'USER',
        targetId: userId,
        details: `Updated user status to ${status || 'unchanged'}, role to ${role || 'unchanged'}`,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
