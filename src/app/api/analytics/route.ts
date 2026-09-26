import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const linkId = searchParams.get('linkId');

    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'yesterday') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get all user links
    const userLinks = await prisma.link.findMany({
      where: {
        userId: user.id,
        ...(linkId ? { id: linkId } : {}),
      },
      select: { id: true, name: true, slug: true },
    });

    const linkIds = userLinks.map((l) => l.id);

    // Fetch clicks within range
    const clicks = await prisma.clickEvent.findMany({
      where: {
        linkId: { in: linkIds },
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch earnings within range
    const earnings = await prisma.earning.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: startDate },
        ...(linkId ? { linkId } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch conversions
    const conversions = await prisma.conversion.findMany({
      where: {
        linkId: { in: linkIds },
        createdAt: { gte: startDate },
        status: 'APPROVED',
      },
    });

    // Aggregations
    const totalClicks = clicks.length;
    const validClicks = clicks.filter((c) => c.status === 'VALID').length;
    const uniqueVisitors = new Set(clicks.map((c) => c.visitorHash)).size;
    const totalEarnings = earnings.reduce((acc, e) => acc + e.amount, 0);
    const conversionCount = conversions.length;
    const conversionRate = validClicks > 0 ? (conversionCount / validClicks) * 100 : 0;
    const ctr = uniqueVisitors > 0 ? (validClicks / uniqueVisitors) * 100 : 100;

    // Time-series grouping for charts
    const timeMap: Record<string, { date: string; clicks: number; visitors: Set<string>; earnings: number }> = {};

    clicks.forEach((c) => {
      const dateKey = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!timeMap[dateKey]) {
        timeMap[dateKey] = { date: dateKey, clicks: 0, visitors: new Set(), earnings: 0 };
      }
      timeMap[dateKey].clicks += 1;
      timeMap[dateKey].visitors.add(c.visitorHash);
    });

    earnings.forEach((e) => {
      const dateKey = new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!timeMap[dateKey]) {
        timeMap[dateKey] = { date: dateKey, clicks: 0, visitors: new Set(), earnings: 0 };
      }
      timeMap[dateKey].earnings += e.amount;
    });

    const timeSeries = Object.values(timeMap).map((item) => ({
      date: item.date,
      clicks: item.clicks,
      visitors: item.visitors.size,
      earnings: Number(item.earnings.toFixed(2)),
    }));

    // Device breakdown
    const deviceCounts: Record<string, number> = {};
    clicks.forEach((c) => {
      const dev = c.device || 'Desktop';
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
    });
    const deviceDistribution = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

    // Country breakdown
    const countryCounts: Record<string, number> = {};
    clicks.forEach((c) => {
      const country = c.country || 'US';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const countryDistribution = Object.entries(countryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Browser breakdown
    const browserCounts: Record<string, number> = {};
    clicks.forEach((c) => {
      const browser = c.browser || 'Other';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });
    const browserDistribution = Object.entries(browserCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Top Referrers
    const referrerCounts: Record<string, number> = {};
    clicks.forEach((c) => {
      const ref = c.referrer && c.referrer !== '' ? c.referrer : 'Direct / Organic';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });
    const topReferrers = Object.entries(referrerCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return NextResponse.json({
      summary: {
        totalClicks,
        validClicks,
        uniqueVisitors,
        totalEarnings: Number(totalEarnings.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
        ctr: Number(ctr.toFixed(1)),
      },
      timeSeries,
      deviceDistribution,
      countryDistribution,
      browserDistribution,
      topReferrers,
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    return NextResponse.json({ error: 'Failed to aggregate analytics' }, { status: 500 });
  }
}
