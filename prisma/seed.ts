import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LinkEarn database with realistic demo data...');

  // Clean existing tables (in order of relations)
  await prisma.adminAction.deleteMany({});
  await prisma.referralEarning.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.conversion.deleteMany({});
  await prisma.earning.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.clickEvent.deleteMany({});
  await prisma.withdrawal.deleteMany({});
  await prisma.link.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.platformSetting.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Platform Settings
  console.log('Creating platform settings...');
  const settings = [
    { key: 'MIN_WITHDRAWAL_AMOUNT', value: '10.00', description: 'Minimum balance required to request a payout ($)' },
    { key: 'REFERRAL_COMMISSION_PERCENT', value: '5.0', description: 'Commission percentage on referred earnings (%)' },
    { key: 'DEFAULT_CURRENCY', value: 'USD', description: 'Default display and payout currency' },
    { key: 'PLATFORM_FEE_PERCENT', value: '15.0', description: 'Platform margin taken from gross advertiser spend' },
    { key: 'FRAUD_MAX_CLICKS_PER_MINUTE', value: '6', description: 'Max allowed clicks from single IP hash per minute' },
    { key: 'FRAUD_MIN_INTERVAL_SECONDS', value: '3', description: 'Minimum interval between clicks from same fingerprint' },
  ];

  for (const s of settings) {
    await prisma.platformSetting.create({ data: s });
  }

  // 2. Passwords
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminSecure123!', salt);
  const userPasswordHash = await bcrypt.hash('Publisher123!', salt);

  // 3. Admin Account
  console.log('Creating Admin account...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@linkearn.com',
      passwordHash: adminPasswordHash,
      name: 'LinkEarn Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      referralCode: 'ADMIN777',
      availableBalance: 0.0,
      pendingBalance: 0.0,
      lifetimeEarnings: 0.0,
      totalWithdrawn: 0.0,
    },
  });

  // 4. Primary Publisher User
  console.log('Creating Demo Publisher account...');
  const demoPublisher = await prisma.user.create({
    data: {
      email: 'publisher@linkearn.com',
      passwordHash: userPasswordHash,
      name: 'Alex Rivera',
      role: 'USER',
      status: 'ACTIVE',
      referralCode: 'ALEX99',
      availableBalance: 148.50,
      pendingBalance: 32.20,
      lifetimeEarnings: 532.70,
      totalWithdrawn: 352.00,
    },
  });

  // 5. Referred Publisher User
  console.log('Creating Referred Publisher account...');
  const referredPublisher = await prisma.user.create({
    data: {
      email: 'sarah.tech@linkearn.com',
      passwordHash: userPasswordHash,
      name: 'Sarah Chen',
      role: 'USER',
      status: 'ACTIVE',
      referralCode: 'SARAH88',
      referredById: demoPublisher.id,
      availableBalance: 86.40,
      pendingBalance: 14.50,
      lifetimeEarnings: 210.90,
      totalWithdrawn: 110.00,
    },
  });

  // Create Referral link
  await prisma.referral.create({
    data: {
      referrerId: demoPublisher.id,
      referredUserId: referredPublisher.id,
      status: 'ACTIVE',
    },
  });

  // 6. Campaigns
  console.log('Creating advertising campaigns...');
  const cpcCampaign = await prisma.campaign.create({
    data: {
      name: 'SaaS Software & Productivity Deals',
      description: 'High converting cloud software, dev tools, and office suites',
      model: 'CPC',
      rate: 0.08, // $0.08 per valid click
      category: 'Software',
      status: 'ACTIVE',
    },
  });

  const cpmCampaign = await prisma.campaign.create({
    data: {
      name: 'Global Tech & Gaming Network',
      description: 'Premium programmatic banner & direct impressions for gaming gear',
      model: 'CPM',
      rate: 2.50, // $2.50 per 1,000 impressions (~$0.0025 per impression)
      category: 'Gaming',
      status: 'ACTIVE',
    },
  });

  const cpaCampaign = await prisma.campaign.create({
    data: {
      name: 'FinTech Credit & Savings App Installs',
      description: 'Verified registrations for digital banking and investing applications',
      model: 'CPA',
      rate: 14.00, // $14.00 per approved conversion
      category: 'Finance',
      status: 'ACTIVE',
    },
  });

  // 7. Demo Links
  console.log('Creating publisher links...');
  const link1 = await prisma.link.create({
    data: {
      userId: demoPublisher.id,
      campaignId: cpcCampaign.id,
      name: 'Best Dev Tools 2026 Roundup',
      slug: 'dev-tools',
      destinationUrl: 'https://github.com/trending',
      description: 'Curated list of developer tools shared on Twitter & Dev.to',
      status: 'ACTIVE',
      totalClicks: 1420,
      validClicks: 1350,
      earnings: 108.00,
    },
  });

  const link2 = await prisma.link.create({
    data: {
      userId: demoPublisher.id,
      campaignId: cpmCampaign.id,
      name: 'Top 10 Gaming Laptops Benchmark',
      slug: 'gaming-benchmark',
      destinationUrl: 'https://store.steampowered.com',
      description: 'Hardware reviews review guide link in YouTube video description',
      status: 'ACTIVE',
      totalClicks: 2890,
      validClicks: 2710,
      earnings: 67.75,
    },
  });

  const link3 = await prisma.link.create({
    data: {
      userId: demoPublisher.id,
      campaignId: cpaCampaign.id,
      name: 'High Yield Savings Calculator Link',
      slug: 'smart-savings',
      destinationUrl: 'https://investopedia.com',
      description: 'Personal finance newsletter referral link',
      status: 'ACTIVE',
      totalClicks: 840,
      validClicks: 790,
      earnings: 168.00,
    },
  });

  const link4 = await prisma.link.create({
    data: {
      userId: demoPublisher.id,
      campaignId: cpcCampaign.id,
      name: 'Remote Work Master Guide',
      slug: 'remote-work',
      destinationUrl: 'https://weworkremotely.com',
      description: 'Job board monetization direct link',
      status: 'PAUSED',
      totalClicks: 410,
      validClicks: 390,
      earnings: 31.20,
    },
  });

  // 8. Generate Realistic Click Events over past 14 days
  console.log('Generating realistic click events and fraud classifications...');
  const countries = ['US', 'US', 'US', 'GB', 'GB', 'DE', 'CA', 'AU', 'IN', 'FR', 'NL'];
  const devices = ['Desktop', 'Desktop', 'Mobile', 'Mobile', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Chrome', 'Safari', 'Firefox', 'Edge'];
  const referrers = ['https://google.com', 'https://twitter.com', 'https://youtube.com', 'https://reddit.com', 'Direct / None'];
  const operatingSystems = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];

  const now = new Date();
  const createdClicks: any[] = [];

  for (let day = 14; day >= 0; day--) {
    const clicksForDay = Math.floor(25 + Math.random() * 35);
    for (let c = 0; c < clicksForDay; c++) {
      const clickDate = new Date(now.getTime() - day * 86400000 - Math.random() * 86400000);
      const isBotPattern = Math.random() < 0.05; // 5% invalid
      const isSuspicious = !isBotPattern && Math.random() < 0.08; // 8% suspicious

      const status = isBotPattern ? 'INVALID' : isSuspicious ? 'SUSPICIOUS' : 'VALID';
      const fraudReason = isBotPattern
        ? 'Automated bot scraper header detected'
        : isSuspicious
        ? 'Rapid frequency threshold near limit'
        : null;

      const randomLink = [link1, link2, link3, link4][Math.floor(Math.random() * 4)];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomDevice = devices[Math.floor(Math.random() * devices.length)];
      const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];
      const randomOs = operatingSystems[Math.floor(Math.random() * operatingSystems.length)];
      const randomReferrer = referrers[Math.floor(Math.random() * referrers.length)];

      const click = await prisma.clickEvent.create({
        data: {
          linkId: randomLink.id,
          visitorHash: `vh_${Math.random().toString(36).substring(2, 10)}`,
          ipAddress: `198.51.100.${Math.floor(Math.random() * 250)}`,
          country: randomCountry,
          device: randomDevice,
          browser: randomBrowser,
          os: randomOs,
          referrer: randomReferrer,
          userAgent: `Mozilla/5.0 (${randomOs}) AppleWebKit/537.36 (KHTML, like Gecko) ${randomBrowser}/122.0.0.0`,
          status,
          fraudReason,
          createdAt: clickDate,
        },
      });

      if (status === 'VALID') {
        createdClicks.push(click);
      }
    }
  }

  // 9. Earnings Records & Transactions
  console.log('Generating earnings records and transactions...');
  let currentBalance = 0;

  // Add individual daily aggregated earnings
  for (let day = 14; day >= 1; day--) {
    const earningAmount = Number((8.50 + Math.random() * 14.50).toFixed(2));
    const earningDate = new Date(now.getTime() - day * 86400000);

    const earnRecord = await prisma.earning.create({
      data: {
        userId: demoPublisher.id,
        linkId: link1.id,
        campaignId: cpcCampaign.id,
        amount: earningAmount,
        type: 'CPC',
        description: `Verified CPC traffic revenue (${earningDate.toLocaleDateString()})`,
        createdAt: earningDate,
      },
    });

    currentBalance += earningAmount;

    await prisma.transaction.create({
      data: {
        userId: demoPublisher.id,
        amount: earningAmount,
        type: 'EARNING',
        balanceAfter: Number(currentBalance.toFixed(2)),
        referenceId: earnRecord.id,
        description: `Ad revenue payout credit`,
        createdAt: earningDate,
      },
    });
  }

  // Referral Earning Record
  const referralBonusAmount = 18.40;
  const refEarnRecord = await prisma.earning.create({
    data: {
      userId: demoPublisher.id,
      amount: referralBonusAmount,
      type: 'REFERRAL_BONUS',
      description: '5% Tier 1 referral commission from Sarah Chen',
      createdAt: new Date(now.getTime() - 2 * 86400000),
    },
  });

  await prisma.referralEarning.create({
    data: {
      referrerId: demoPublisher.id,
      referredUserId: referredPublisher.id,
      sourceEarningId: refEarnRecord.id,
      commissionRate: 0.05,
      amount: referralBonusAmount,
      createdAt: new Date(now.getTime() - 2 * 86400000),
    },
  });

  // 10. Withdrawals
  console.log('Creating withdrawals...');
  // Completed withdrawal
  await prisma.withdrawal.create({
    data: {
      userId: demoPublisher.id,
      amount: 250.00,
      paymentMethod: 'PAYPAL',
      paymentDetails: JSON.stringify({ email: 'alex.rivera.pay@gmail.com' }),
      notes: 'Monthly payout request',
      adminNote: 'Processed via PayPal MassPay Batch #8921',
      status: 'PAID',
      processedAt: new Date(now.getTime() - 10 * 86400000),
      createdAt: new Date(now.getTime() - 11 * 86400000),
    },
  });

  await prisma.withdrawal.create({
    data: {
      userId: demoPublisher.id,
      amount: 102.00,
      paymentMethod: 'CRYPTO_USDT',
      paymentDetails: JSON.stringify({ network: 'TRC20', address: 'TLyqzVGLV1nmUQMRn48hJbTqX7gL4X5c' }),
      notes: 'Crypto USDT TRC20 payout',
      adminNote: 'TxHash: 0x8a92b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
      status: 'PAID',
      processedAt: new Date(now.getTime() - 4 * 86400000),
      createdAt: new Date(now.getTime() - 5 * 86400000),
    },
  });

  // Pending withdrawal
  await prisma.withdrawal.create({
    data: {
      userId: demoPublisher.id,
      amount: 65.00,
      paymentMethod: 'PAYPAL',
      paymentDetails: JSON.stringify({ email: 'alex.rivera.pay@gmail.com' }),
      notes: 'Mid-month withdrawal',
      status: 'PENDING',
      createdAt: new Date(now.getTime() - 1 * 86400000),
    },
  });

  // Processing withdrawal for referred user
  await prisma.withdrawal.create({
    data: {
      userId: referredPublisher.id,
      amount: 110.00,
      paymentMethod: 'WIRE_TRANSFER',
      paymentDetails: JSON.stringify({ bank: 'Chase', ibanMasked: '****4819' }),
      notes: 'First payout request',
      adminNote: 'Sent to accounting batch processing',
      status: 'PROCESSING',
      createdAt: new Date(now.getTime() - 2 * 86400000),
    },
  });

  // 11. Admin Action Audit Log
  console.log('Logging sample admin actions...');
  await prisma.adminAction.create({
    data: {
      adminId: adminUser.id,
      action: 'WITHDRAWAL_APPROVE',
      targetType: 'WITHDRAWAL',
      targetId: 'wd_demo_payout',
      details: 'Approved $250.00 withdrawal for Alex Rivera',
      createdAt: new Date(now.getTime() - 10 * 86400000),
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId: adminUser.id,
      action: 'CAMPAIGN_CREATE',
      targetType: 'CAMPAIGN',
      targetId: cpcCampaign.id,
      details: 'Created SaaS Software campaign with $0.08 CPC rate',
      createdAt: new Date(now.getTime() - 20 * 86400000),
    },
  });

  console.log('Database seeding successfully finished!');
  console.log('--------------------------------------------------');
  console.log('DEMO CREDENTIALS:');
  console.log('Admin Account:');
  console.log('  Email:    admin@linkearn.com');
  console.log('  Password: AdminSecure123!');
  console.log('');
  console.log('Publisher Account:');
  console.log('  Email:    publisher@linkearn.com');
  console.log('  Password: Publisher123!');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
