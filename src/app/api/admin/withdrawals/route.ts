import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            availableBalance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error('Error in admin withdrawals:', error);
    return NextResponse.json({ error: 'Unauthorized or forbidden' }, { status: 403 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { withdrawalId, status, adminNote } = body;

    if (!withdrawalId || !status) {
      return NextResponse.json(
        { error: 'Withdrawal ID and target status are required' },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal record not found' }, { status: 404 });
    }

    // Process status transition with ledger consistency
    const updated = await prisma.$transaction(async (tx) => {
      // If rejecting and it was not previously rejected or paid, refund the pending balance back to available
      if (status === 'REJECTED' && withdrawal.status !== 'REJECTED' && withdrawal.status !== 'PAID') {
        const updatedUser = await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            pendingBalance: { decrement: withdrawal.amount },
            availableBalance: { increment: withdrawal.amount },
          },
        });

        await tx.transaction.create({
          data: {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: 'ADJUSTMENT',
            balanceAfter: updatedUser.availableBalance,
            referenceId: withdrawal.id,
            description: `Refund: Rejected withdrawal #${withdrawal.id.substring(0, 8)} (${adminNote || 'Admin rejection'})`,
          },
        });
      }

      // If marking as PAID and it wasn't already PAID
      if (status === 'PAID' && withdrawal.status !== 'PAID') {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            pendingBalance: { decrement: withdrawal.amount },
            totalWithdrawn: { increment: withdrawal.amount },
          },
        });
      }

      const res = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status,
          adminNote: adminNote !== undefined ? adminNote : withdrawal.adminNote,
          ...(status === 'PAID' ? { processedAt: new Date() } : {}),
        },
      });

      // Audit Log
      await tx.adminAction.create({
        data: {
          adminId: admin.id,
          action: `WITHDRAWAL_${status}`,
          targetType: 'WITHDRAWAL',
          targetId: withdrawal.id,
          details: `Status set to ${status}. Amount: $${withdrawal.amount}. Note: ${adminNote || 'None'}`,
        },
      });

      return res;
    });

    return NextResponse.json({ success: true, withdrawal: updated });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json({ error: 'Failed to update withdrawal' }, { status: 500 });
  }
}
