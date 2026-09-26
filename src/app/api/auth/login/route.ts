import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { comparePassword, createSessionToken, setSessionCookie } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
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

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

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
    });

    response.cookies.set('linkearn_session', token, {
      httpOnly: true,
      secure: false, // Compatible with localhost, HTTP tunnels, and HTTPS
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days permanent login session
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
