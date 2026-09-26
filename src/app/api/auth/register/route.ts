import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  hashPassword,
  generateReferralCode,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth';
import { passwordComplexitySchema } from '@/lib/password';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordComplexitySchema,
  referralCode: z.string().optional().nullable(),
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

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid registration data' },
        { status: 400 }
      );
    }

    const { name, email, password, referralCode } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      );
    }

    // Check referral code if provided
    let referrerId: string | null = null;
    if (referralCode && typeof referralCode === 'string' && referralCode.trim() !== '') {
      const cleanRefCode = referralCode.trim().toUpperCase();
      const referrer = await prisma.user.findUnique({
        where: { referralCode: cleanRefCode },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Generate unique referral code for the new user (with safety loop)
    let userReferralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const collision = await prisma.user.findUnique({ where: { referralCode: userReferralCode } });
      if (!collision) break;
      userReferralCode = generateReferralCode();
      attempts++;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        referralCode: userReferralCode,
        referredById: referrerId,
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    // Create Referral relationship record if referred
    if (referrerId) {
      try {
        await prisma.referral.create({
          data: {
            referrerId,
            referredUserId: newUser.id,
            status: 'ACTIVE',
          },
        });
      } catch (refErr) {
        console.warn('Non-critical referral record creation notice:', refErr);
      }
    }

    // Create JWT session token
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Try standard cookie store
    try {
      await setSessionCookie(token);
    } catch (cookieErr) {
      console.warn('Cookie store fallback triggered:', cookieErr);
    }

    // Prepare JSON response
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          referralCode: newUser.referralCode,
        },
      },
      { status: 201 }
    );

    // Explicitly set cookie on NextResponse headers for 100% reliability
    response.cookies.set('linkearn_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error details:', error);

    // Prisma Unique Constraint check (P2002)
    if (error?.code === 'P2002') {
      const target = error?.meta?.target;
      if (Array.isArray(target) && target.includes('email')) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please log in.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'An account with these details already exists. Please try another email.' },
        { status: 409 }
      );
    }

    const message =
      error?.message && typeof error.message === 'string'
        ? error.message
        : 'Could not create account. Please verify your details and try again.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
