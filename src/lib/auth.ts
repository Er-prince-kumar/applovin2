import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import prisma from './prisma';
import { ensurePayoutDetailsPersisted } from './payout-storage';
import { ensureBalancePersisted, saveBalanceBackup } from './earning-storage';
import { getUserBackup, verifyUserVaultToken, resurrectUserIntoDb } from './user-storage';

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
    let token: string | undefined;

    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {}

    if (!token) {
      try {
        const headerStore = await headers();
        const authHeader = headerStore.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7).trim();
        }
      } catch {}
    }

    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    let user = await prisma.user.findUnique({
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

    // If user not in database (e.g. cold start / new serverless lambda), resurrect from multi-tier backup or vault cookie
    if (!user) {
      let backupRecord = getUserBackup(payload.userId) || (payload.email ? getUserBackup(payload.email) : null);
      if (!backupRecord && payload.email) {
        try {
          const cookieStore = await cookies();
          const safeEmailKey = payload.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
          const vaultCookie =
            cookieStore.get(`linkearn_vault_${safeEmailKey}`)?.value ||
            cookieStore.get('linkearn_last_vault')?.value;
          if (vaultCookie) {
            backupRecord = await verifyUserVaultToken(vaultCookie);
          }
        } catch {}
      }

      if (backupRecord) {
        await resurrectUserIntoDb(backupRecord);
        user = await prisma.user.findUnique({
          where: { id: backupRecord.id },
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
      }
    }

    if (!user || user.status === 'SUSPENDED') {
      return null;
    }

    // Auto-heal payout details from permanent backup if not present in user row
    if (!user.payoutDetails) {
      const restored = await ensurePayoutDetailsPersisted(user.id, user.email, null);
      if (restored) {
        user.payoutDetails = restored;
      }
    }

    // Auto-heal availableBalance and lifetimeEarnings from multi-tier backup & balance cookie
    try {
      // 1. Check if client has sent an active balance cookie
      let cookieBalance: number | undefined;
      let cookieLifetime: number | undefined;

      try {
        const cookieStore = await cookies();
        const balCookie = cookieStore.get(`linkearn_bal_${user.id}`)?.value;
        if (balCookie) {
          const parsed = JSON.parse(decodeURIComponent(balCookie));
          if (parsed && typeof parsed.availableBalance === 'number') {
            cookieBalance = parsed.availableBalance;
            cookieLifetime = parsed.lifetimeEarnings;
          }
        }
      } catch {}

      if (cookieBalance !== undefined && cookieBalance > user.availableBalance) {
        user.availableBalance = cookieBalance;
        if (cookieLifetime !== undefined && cookieLifetime > user.lifetimeEarnings) {
          user.lifetimeEarnings = cookieLifetime;
        }
        // Save to file backup
        saveBalanceBackup(user.id, user.email, {
          availableBalance: user.availableBalance,
          lifetimeEarnings: user.lifetimeEarnings,
        });
      }

      // 2. Check multi-tier file backup
      const healed = await ensureBalancePersisted(
        user.id,
        user.email,
        user.availableBalance,
        user.lifetimeEarnings
      );
      if (healed) {
        user.availableBalance = healed.availableBalance;
        user.lifetimeEarnings = healed.lifetimeEarnings;
      }
    } catch (balErr) {
      console.error('Error auto-healing user balances:', balErr);
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
