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
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid registration data' },
        { status: 400 }
      );
    }

    const { name, email, password, referralCode } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    // Check referral code if provided
    let referrerId: string | null = null;
    if (referralCode && referralCode.trim() !== '') {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.trim().toUpperCase() },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Generate unique referral code for the new user
    let userReferralCode = generateReferralCode();
    let collision = await prisma.user.findUnique({ where: { referralCode: userReferralCode } });
    while (collision) {
      userReferralCode = generateReferralCode();
      collision = await prisma.user.findUnique({ where: { referralCode: userReferralCode } });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
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
      await prisma.referral.create({
        data: {
          referrerId,
          referredUserId: newUser.id,
          status: 'ACTIVE',
        },
      });
    }

    // Create session token and set cookie
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    await setSessionCookie(token);

    return NextResponse.json(
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
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
