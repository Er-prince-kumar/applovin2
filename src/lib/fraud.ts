import crypto from 'crypto';
import prisma from './prisma';

export interface TrafficAnalysisResult {
  status: 'VALID' | 'SUSPICIOUS' | 'INVALID';
  fraudReason: string | null;
  visitorHash: string;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  country: string;
}

// Known bot and scraper patterns
const BOT_SIGNATURES = [
  /bot/i,
  /spider/i,
  /crawl/i,
  /slurp/i,
  /mediapartners/i,
  /curl/i,
  /wget/i,
  /python/i,
  /urllib/i,
  /httpclient/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /postman/i,
  /lighthouse/i,
];

export function parseDeviceAndBrowser(userAgent: string) {
  let device = 'Desktop';
  let browser = 'Chrome';
  let os = 'Windows';

  // Device Detection
  if (/mobile/i.test(userAgent)) {
    device = 'Mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    device = 'Tablet';
  }

  // OS Detection
  if (/windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = 'macOS';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  }

  // Browser Detection
  if (/edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/chrome|crios/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera';
  } else {
    browser = 'Other';
  }

  return { device, browser, os };
}

export function generateVisitorHash(ip: string, userAgent: string, acceptLanguage?: string): string {
  const raw = `${ip}_${userAgent}_${acceptLanguage || ''}`;
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 24);
}

export async function evaluateTraffic({
  linkId,
  ip,
  userAgent,
  acceptLanguage,
  countryHeader,
}: {
  linkId: string;
  ip: string;
  userAgent: string;
  acceptLanguage?: string;
  countryHeader?: string | null;
}): Promise<TrafficAnalysisResult> {
  const visitorHash = generateVisitorHash(ip, userAgent, acceptLanguage);
  const { device, browser, os } = parseDeviceAndBrowser(userAgent);
  const country = (countryHeader || 'US').toUpperCase().substring(0, 2);

  // Anonymize IP address for legal privacy compliance (e.g. 192.168.1.xxx)
  const ipParts = ip.split('.');
  const anonymizedIp = ipParts.length === 4 ? `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.xxx` : ip;

  // 1. Bot & Scraper check
  const isBot = BOT_SIGNATURES.some((pattern) => pattern.test(userAgent));
  if (isBot) {
    return {
      status: 'INVALID',
      fraudReason: 'Known crawler, bot, or automated testing user-agent signature',
      visitorHash,
      ipAddress: anonymizedIp,
      device,
      browser,
      os,
      country,
    };
  }

  // 2. Missing essential browser headers
  if (!userAgent || userAgent.length < 15) {
    return {
      status: 'INVALID',
      fraudReason: 'Malformed or truncated user-agent header',
      visitorHash,
      ipAddress: anonymizedIp,
      device,
      browser,
      os,
      country,
    };
  }

  // 3. Frequency & Rate limit checks against this link
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const fiveSecondsAgo = new Date(Date.now() - 5 * 1000);

  // Check clicks in the last 5 seconds from same visitor hash (rapid burst check)
  const rapidClicks = await prisma.clickEvent.count({
    where: {
      linkId,
      visitorHash,
      createdAt: { gte: fiveSecondsAgo },
    },
  });

  if (rapidClicks >= 1) {
    return {
      status: 'INVALID',
      fraudReason: 'Sub-second or rapid duplicate click burst detected',
      visitorHash,
      ipAddress: anonymizedIp,
      device,
      browser,
      os,
      country,
    };
  }

  // Check clicks in the last minute from same visitor hash
  const recentClicks = await prisma.clickEvent.count({
    where: {
      linkId,
      visitorHash,
      createdAt: { gte: oneMinuteAgo },
    },
  });

  if (recentClicks >= 5) {
    return {
      status: 'SUSPICIOUS',
      fraudReason: 'High frequency click pattern from identical fingerprint (>5/min)',
      visitorHash,
      ipAddress: anonymizedIp,
      device,
      browser,
      os,
      country,
    };
  }

  // 4. Overall IP burst across the entire platform
  const ipBurstClicks = await prisma.clickEvent.count({
    where: {
      visitorHash,
      createdAt: { gte: oneMinuteAgo },
    },
  });

  if (ipBurstClicks >= 15) {
    return {
      status: 'SUSPICIOUS',
      fraudReason: 'Network-wide anomalous click volume from fingerprint',
      visitorHash,
      ipAddress: anonymizedIp,
      device,
      browser,
      os,
      country,
    };
  }

  return {
    status: 'VALID',
    fraudReason: null,
    visitorHash,
    ipAddress: anonymizedIp,
    device,
    browser,
    os,
    country,
  };
}
