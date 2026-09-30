import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { comparePassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import {
  getUserBackup,
  saveUserBackup,
  verifyUserVaultToken,
  createUserVaultToken,
  resurrectUserIntoDb,
  UserBackupRecord,
} from '@/lib/user-storage';

const loginSchema = z.object({
  email: z.string().transform((v) => v.toLowerCase().trim()).pipe(z.string().email('Please enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
  clientVault: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request format' },
        { status: 400 }
      );
    }

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid credentials' },
        { status: 400 }
      );
    }

    const { email, password, clientVault } = result.data;
    const normalizedEmail = email;

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If user not in database (e.g. cold start / new serverless lambda container), attempt multi-tier resurrection
    if (!user) {
      let backupRecord: UserBackupRecord | null = null;

      // 1. Check clientVault provided directly by the frontend
      if (clientVault) {
        backupRecord = await verifyUserVaultToken(clientVault);
      }

      // 2. Check vault cookies from browser
      if (!backupRecord) {
        const safeEmailKey = normalizedEmail.replace(/[^a-z0-9]/g, '_');
        const vaultCookie =
          request.cookies.get(`linkearn_vault_${safeEmailKey}`)?.value ||
          request.cookies.get('linkearn_last_vault')?.value;
        if (vaultCookie) {
          backupRecord = await verifyUserVaultToken(vaultCookie);
        }
      }

      // 3. Check permanent file backups
      if (!backupRecord) {
        backupRecord = getUserBackup(normalizedEmail);
      }

      // Recreate user in this lambda's SQLite database if authentic backup found
      if (backupRecord && backupRecord.email.toLowerCase().trim() === normalizedEmail) {
        user = await resurrectUserIntoDb(backupRecord);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password combination' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password combination' },
        { status: 401 }
      );
    }

    // Refresh user backup and vault token
    saveUserBackup({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      status: user.status,
      referralCode: user.referralCode,
      referredById: user.referredById,
      availableBalance: user.availableBalance,
      lifetimeEarnings: user.lifetimeEarnings,
    });

    const vaultToken = await createUserVaultToken(user);

    // Create session token and set cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    try {
      await setSessionCookie(token);
    } catch (cookieErr) {
      console.warn('Cookie store fallback triggered in login:', cookieErr);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
      },
      vaultToken,
    });

    response.cookies.set('linkearn_session', token, {
      httpOnly: true,
      secure: false, // Compatible with localhost, HTTP tunnels, and HTTPS
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days permanent login session
      path: '/',
    });

    // 365 days signed account vault cookie
    const safeEmailKey = normalizedEmail.replace(/[^a-z0-9]/g, '_');
    response.cookies.set(`linkearn_vault_${safeEmailKey}`, vaultToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });

    response.cookies.set('linkearn_last_vault', vaultToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    const message =
      error?.message && typeof error.message === 'string'
        ? error.message
        : 'An error occurred during login. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
