import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  hashPassword,
  comparePassword,
  generateReferralCode,
  createSessionToken,
  verifySessionToken,
} from '../src/lib/auth';
import { evaluateTraffic, parseDeviceAndBrowser, generateVisitorHash } from '../src/lib/fraud';
import { processEarningForClick } from '../src/lib/earning-engine';

const prisma = new PrismaClient();

async function runTests() {
  console.log('\n==================================================');
  console.log('STARTING LINKEARN COMPREHENSIVE TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Password Hashing & Referral Code Generation
    // ----------------------------------------------------
    console.log('\n[1/7] Testing Authentication & Security Primitives...');
    const plain = 'SuperSecurePass123!';
    const hashed = await hashPassword(plain);
    assert(hashed !== plain, 'Password is not plaintext');
    assert(await comparePassword(plain, hashed), 'Correct password verifies successfully');
    assert(!(await comparePassword('WrongPassword', hashed)), 'Incorrect password fails verification');

    const refCode = generateReferralCode(6);
    assert(refCode.length === 6 && /^[A-Z0-9]+$/.test(refCode), 'Generates valid 6-char alphanumeric referral code');

    // ----------------------------------------------------
    // TEST 2: Session Token Minting & Verification
    // ----------------------------------------------------
    console.log('\n[2/7] Testing JWT Session Tokens...');
    const sessionPayload = { userId: 'usr_test_123', email: 'test@linkearn.com', role: 'USER' };
    const token = await createSessionToken(sessionPayload);
    assert(typeof token === 'string' && token.length > 20, 'Generates signed session JWT');

    const verified = await verifySessionToken(token);
    assert(verified?.userId === sessionPayload.userId, 'Session token payload accurately verified');
    assert(verified?.role === sessionPayload.role, 'Session role preserved accurately');

    const invalidVerify = await verifySessionToken('corrupted.token.signature');
    assert(invalidVerify === null, 'Malformed session token safely returns null');

    // ----------------------------------------------------
    // TEST 3: Defensive Traffic Engine & Fraud Classification
    // ----------------------------------------------------
    console.log('\n[3/7] Testing Defensive Fraud & Traffic Quality Engine...');
    const userAgentChrome =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    const { device, browser, os } = parseDeviceAndBrowser(userAgentChrome);
    assert(device === 'Desktop', 'Detects Desktop device');
    assert(browser === 'Chrome', 'Detects Chrome browser');
    assert(os === 'Windows', 'Detects Windows OS');

    const mobileAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    assert(parseDeviceAndBrowser(mobileAgent).device === 'Mobile', 'Detects Mobile iPhone device');

    // Check Bot user-agent
    const botAnalysis = await evaluateTraffic({
      linkId: 'test_link',
      ip: '192.168.1.100',
      userAgent: 'python-requests/2.28.1 (compatible; bot)',
      countryHeader: 'US',
    });
    assert(botAnalysis.status === 'INVALID', 'Marks automated bot / python scraper as INVALID');
    assert(botAnalysis.fraudReason !== null, 'Provides descriptive fraudReason for bot traffic');

    // Check Valid traffic
    const validAnalysis = await evaluateTraffic({
      linkId: 'test_link_valid',
      ip: '203.0.113.45',
      userAgent: userAgentChrome,
      countryHeader: 'US',
    });
    assert(validAnalysis.status === 'VALID', 'Marks clean human browser request as VALID');
    assert(validAnalysis.ipAddress.endsWith('.xxx'), 'Anonymizes IP address for legal privacy');

    // ----------------------------------------------------
    // TEST 4: Database Models & User Registration Flow
    // ----------------------------------------------------
    console.log('\n[4/7] Testing Database Seed Data & User Flow...');
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@linkearn.com' } });
    assert(adminUser !== null, 'Admin user account exists');
    assert(adminUser?.role === 'ADMIN', 'Admin has ADMIN role');

    const publisher = await prisma.user.findUnique({ where: { email: 'publisher@linkearn.com' } });
    assert(publisher !== null, 'Demo publisher account exists');
    assert(publisher?.role === 'USER', 'Publisher has USER role');

    // ----------------------------------------------------
    // TEST 5: Direct Link Resolution & Redirect Integrity
    // ----------------------------------------------------
    console.log('\n[5/7] Testing Direct Link System...');
    const demoLink = await prisma.link.findFirst({
      where: { userId: publisher?.id, status: 'ACTIVE' },
      include: { campaign: true },
    });
    assert(demoLink !== null, 'Active monetization link exists');
    assert(typeof demoLink?.slug === 'string', 'Link has unique slug');
    assert(Boolean(demoLink?.destinationUrl.startsWith('http')), 'Destination URL is valid HTTP/HTTPS');

    // ----------------------------------------------------
    // TEST 6: Earning Engine & Referral Commission Calculations
    // ----------------------------------------------------
    console.log('\n[6/7] Testing Earning Engine & Referral Ledger...');
    if (demoLink && publisher) {
      const initialBalance = publisher.availableBalance;

      // Create a test click event
      const testClick = await prisma.clickEvent.create({
        data: {
          linkId: demoLink.id,
          visitorHash: `vh_unit_${Date.now()}`,
          ipAddress: '198.51.100.99',
          status: 'VALID',
        },
      });

      const earningResult = await processEarningForClick({
        linkId: demoLink.id,
        clickEventId: testClick.id,
      });

      assert(earningResult !== null && earningResult.amount > 0, 'Processes earning for valid click event');

      const updatedPublisher = await prisma.user.findUnique({ where: { id: publisher.id } });
      assert(
        (updatedPublisher?.availableBalance || 0) > initialBalance,
        'Publisher availableBalance credited correctly'
      );

      // Verify immutable ledger transaction was created
      const tx = await prisma.transaction.findFirst({
        where: { userId: publisher.id, referenceId: earningResult?.earningId },
      });
      assert(tx !== null, 'Immutable transaction entry logged in database ledger');
    }

    // ----------------------------------------------------
    // TEST 7: Withdrawal System & Minimum Thresholds
    // ----------------------------------------------------
    console.log('\n[7/7] Testing Withdrawal System & Balances...');
    const setting = await prisma.platformSetting.findUnique({ where: { key: 'MIN_WITHDRAWAL_AMOUNT' } });
    const minWd = setting ? parseFloat(setting.value) : 10.0;
    assert(minWd === 10.0, 'Configured minimum withdrawal threshold matches platform default ($10.00)');

    const userWithdrawal = await prisma.withdrawal.findFirst({
      where: { userId: publisher?.id },
    });
    assert(userWithdrawal !== null, 'Withdrawal records present and queryable');
    assert(
      ['PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED'].includes(userWithdrawal?.status || ''),
      'Withdrawal has valid status enum'
    );
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n==================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
