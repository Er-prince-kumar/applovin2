async function verifyLiveApp() {
  console.log('Testing live LinkEarn application on http://localhost:3000...\n');
  const baseUrl = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  try {
    // 1. Landing Page
    const landingRes = await fetch(`${baseUrl}/`);
    assert(landingRes.status === 200, 'Landing page (/) returns 200 OK');
    const landingHtml = await landingRes.text();
    assert(landingHtml.includes('Monetize Your'), 'Landing page contains hero text');

    // 2. Authentication: Publisher Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'publisher@linkearn.com',
        password: 'Publisher123!',
      }),
    });
    assert(loginRes.status === 200, 'Publisher login API returns 200 OK');
    const loginData = await loginRes.json();
    assert(loginData.user?.role === 'USER', 'Logged in as USER');
    const setCookieHeader = loginRes.headers.get('set-cookie');
    assert(Boolean(setCookieHeader && setCookieHeader.includes('linkearn_session')), 'Session cookie returned');
    const publisherCookie = setCookieHeader?.split(';')[0] || '';

    // 3. User Dashboard
    const dashRes = await fetch(`${baseUrl}/dashboard`, {
      headers: { Cookie: publisherCookie },
    });
    assert(dashRes.status === 200, 'Publisher dashboard (/dashboard) returns 200 OK');

    // 4. Create Monetization Link
    const testSlug = `live-test-${Date.now().toString(36)}`;
    const createLinkRes = await fetch(`${baseUrl}/api/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: publisherCookie,
      },
      body: JSON.stringify({
        name: 'Live Verified Link',
        destinationUrl: 'https://en.wikipedia.org/wiki/Web_monetization',
        slug: testSlug,
        status: 'ACTIVE',
      }),
    });
    assert(createLinkRes.status === 201, 'POST /api/links creates smart link (201 Created)');
    const createdLink = await createLinkRes.json();
    assert(createdLink.link?.slug === testSlug, 'Link created with correct slug');

    // 5. Test Public Redirect /go/[slug]
    const redirectRes = await fetch(`${baseUrl}/go/${testSlug}`, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0',
      },
    });
    assert([302, 307].includes(redirectRes.status), '/go/[slug] responds with 302/307 redirect');
    const redirectLocation = redirectRes.headers.get('location');
    assert(
      Boolean(redirectLocation?.includes('wikipedia.org')),
      'Redirect location correctly matches target destination URL'
    );

    // 6. Test Requesting a Payout
    const withdrawRes = await fetch(`${baseUrl}/api/withdrawals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: publisherCookie,
      },
      body: JSON.stringify({
        amount: 12.00,
        paymentMethod: 'PAYPAL',
        paymentDetails: 'publisher.payout@gmail.com',
        notes: 'Automated E2E test payout',
      }),
    });
    assert(withdrawRes.status === 201, 'POST /api/withdrawals creates payout request (201 Created)');
    const withdrawData = await withdrawRes.json();
    const createdWithdrawalId = withdrawData.withdrawal?.id;

    // 7. Test Admin Login
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@linkearn.com',
        password: 'AdminSecure123!',
      }),
    });
    assert(adminLoginRes.status === 200, 'Admin login API returns 200 OK');
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginData.user?.role === 'ADMIN', 'Logged in as ADMIN');
    const adminCookie = adminLoginRes.headers.get('set-cookie')?.split(';')[0] || '';

    // 8. Admin Control Center & Queues
    const adminOverviewRes = await fetch(`${baseUrl}/admin`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminOverviewRes.status === 200, 'Admin overview (/admin) returns 200 OK');

    const adminTrafficRes = await fetch(`${baseUrl}/admin/traffic`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminTrafficRes.status === 200, 'Admin traffic inspector (/admin/traffic) returns 200 OK');

    // 9. Admin Approving Payout
    if (createdWithdrawalId) {
      const approveRes = await fetch(`${baseUrl}/api/admin/withdrawals`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: adminCookie,
        },
        body: JSON.stringify({
          withdrawalId: createdWithdrawalId,
          status: 'APPROVED',
          adminNote: 'E2E auto-verified by test agent',
        }),
      });
      assert(approveRes.status === 200, 'Admin can APPROVE withdrawal in queue (200 OK)');
    }

    // 10. Admin Reports & Financial Audits
    const adminReportsRes = await fetch(`${baseUrl}/admin/reports`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminReportsRes.status === 200, 'Admin financial reports (/admin/reports) returns 200 OK');

    // 11. Mobile App Download Page
    const downloadPageRes = await fetch(`${baseUrl}/download`);
    assert(downloadPageRes.status === 200, 'Mobile download page (/download) returns 200 OK');
    const downloadPageHtml = await downloadPageRes.text();
    assert(
      downloadPageHtml.includes('Android') && downloadPageHtml.includes('APK'),
      'Download page includes Android APK download information'
    );

    // 12. Direct APK Download API
    const apkDownloadRes = await fetch(`${baseUrl}/api/download/apk`);
    assert(apkDownloadRes.status === 200, 'Direct APK API (/api/download/apk) returns 200 OK');
    assert(
      apkDownloadRes.headers.get('content-type') === 'application/vnd.android.package-archive',
      'APK content-type is application/vnd.android.package-archive'
    );
    const contentDisposition = apkDownloadRes.headers.get('content-disposition') || '';
    assert(
      contentDisposition.includes('LinkEarn-Publisher-v1.0.0.apk'),
      'APK content-disposition specifies LinkEarn-Publisher-v1.0.0.apk'
    );
    const apkBuffer = await apkDownloadRes.arrayBuffer();
    assert(apkBuffer.byteLength > 1000, `APK file served with valid size (${apkBuffer.byteLength} bytes)`);
  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  }

  console.log('\n==================================================');
  console.log(`LIVE SERVER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
}

verifyLiveApp();
