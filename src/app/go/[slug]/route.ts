import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evaluateTraffic } from '@/lib/fraud';
import { processEarningForClick } from '@/lib/earning-engine';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return new NextResponse('Invalid link parameters', { status: 400 });
    }

    // 1. Fetch link with campaign and publisher status
    const link = await prisma.link.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!link) {
      return NextResponse.redirect(new URL('/link-error?error=not_found', request.url));
    }

    if (link.status !== 'ACTIVE' || link.user?.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/link-error?error=inactive', request.url));
    }

    // 2. Extract request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || 'Direct';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const countryHeader =
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('x-country-code') ||
      'US';

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // 3. Defensive Traffic & Fraud Engine Evaluation
    const analysis = await evaluateTraffic({
      linkId: link.id,
      ip,
      userAgent,
      acceptLanguage,
      countryHeader,
    });

    // 4. Record Click Event
    const clickEvent = await prisma.clickEvent.create({
      data: {
        linkId: link.id,
        visitorHash: analysis.visitorHash,
        ipAddress: analysis.ipAddress,
        country: analysis.country,
        device: analysis.device,
        browser: analysis.browser,
        os: analysis.os,
        referrer: referrer.substring(0, 500),
        userAgent: userAgent.substring(0, 500),
        status: analysis.status,
        fraudReason: analysis.fraudReason,
      },
    });

    // 5. Earnings calculation if VALID
    if (analysis.status === 'VALID') {
      await processEarningForClick({
        linkId: link.id,
        clickEventId: clickEvent.id,
      });
    } else {
      // For SUSPICIOUS or INVALID traffic: register click count only, NO earnings
      await prisma.link.update({
        where: { id: link.id },
        data: {
          totalClicks: { increment: 1 },
        },
      });
    }

    // 6. Validate safe destination URL against open-redirect schemes
    let destination = link.destinationUrl.trim();
    if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
      destination = `https://${destination}`;
    }

    // Validate URL syntax
    try {
      new URL(destination);
    } catch {
      return NextResponse.redirect(new URL('/link-error?error=malformed_url', request.url));
    }

    // 7. Fast Redirect
    return NextResponse.redirect(destination, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (err) {
    console.error('Error handling redirect:', err);
    return NextResponse.redirect(new URL('/link-error?error=system_error', request.url));
  }
}
