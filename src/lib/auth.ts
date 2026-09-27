import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import prisma from './prisma';
import { ensurePayoutDetailsPersisted } from './payout-storage';

const SESSION_COOKIE_NAME = 'linkearn_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'linkearn-production-secure-auth-secret-key-32-chars-min'
);

export interface AuthSessionPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateReferralCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createSessionToken(payload: AuthSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<AuthSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthSessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, // Ensures cookies are never dropped on HTTP tunnels or localhost
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days permanent login session
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        referralCode: true,
        referredById: true,
        availableBalance: true,
        pendingBalance: true,
        lifetimeEarnings: true,
        totalWithdrawn: true,
        payoutDetails: true,
        createdAt: true,
      },
    });

    if (!user || user.status === 'SUSPENDED') {
      return null;
    }

    if (!user.payoutDetails) {
      const restored = await ensurePayoutDetailsPersisted(user.id, user.email, null);
      if (restored) {
        user.payoutDetails = restored;
      }
    }

    // Dynamic Yield Reconciliation: Ensure availableBalance & lifetimeEarnings reflect all link and task earnings
    try {
      const [linkAgg, taskAgg, approvedW, pendingW] = await Promise.all([
        prisma.link.aggregate({
          where: { userId: user.id },
          _sum: { earnings: true },
        }),
        prisma.earning.aggregate({
          where: { userId: user.id, linkId: null },
          _sum: { amount: true },
        }),
        prisma.withdrawal.aggregate({
          where: { userId: user.id, status: { in: ['APPROVED', 'PAID'] } },
          _sum: { amount: true },
        }),
        prisma.withdrawal.aggregate({
          where: { userId: user.id, status: { in: ['PENDING', 'PROCESSING'] } },
          _sum: { amount: true },
        }),
      ]);

      const totalEarned = Number(((linkAgg._sum.earnings || 0) + (taskAgg._sum.amount || 0)).toFixed(2));
      const totalDisbursed = Number((approvedW._sum.amount || 0).toFixed(2));
      const totalPending = Number((pendingW._sum.amount || 0).toFixed(2));
      const calculatedAvailable = Number(Math.max(0, totalEarned - totalDisbursed - totalPending).toFixed(2));

      if (
        user.lifetimeEarnings !== totalEarned ||
        user.availableBalance !== calculatedAvailable ||
        user.pendingBalance !== totalPending ||
        user.totalWithdrawn !== totalDisbursed
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lifetimeEarnings: totalEarned,
            availableBalance: calculatedAvailable,
            pendingBalance: totalPending,
            totalWithdrawn: totalDisbursed,
          },
        });
        user.lifetimeEarnings = totalEarned;
        user.availableBalance = calculatedAvailable;
        user.pendingBalance = totalPending;
        user.totalWithdrawn = totalDisbursed;
      }
    } catch (e) {
      console.warn('Yield reconciliation error:', e);
    }

    return user;
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    console.error('Error fetching current user:', err);
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
