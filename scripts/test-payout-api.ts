import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/auth';

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'princebxr2000@gmail.com' } });
  if (!user) {
    console.log('User not found');
    return;
  }
  const token = await createSessionToken({ userId: user.id, email: user.email, role: user.role });

  console.log('--- 1. GET before ---');
  let res = await fetch('http://localhost:3000/api/user/payout-method', {
    headers: { Cookie: `linkearn_session=${token}` },
  });
  console.log('GET before status:', res.status, await res.json());

  console.log('--- 2. POST bank details ---');
  const payload = {
    type: 'BANK_TRANSFER',
    accountHolder: 'Prince Kumar',
    bankName: 'State Bank of India',
    accountNumber: '123456789012',
    ifscCode: 'SBIN0001234',
    accountType: 'Savings',
  };
  res = await fetch('http://localhost:3000/api/user/payout-method', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `linkearn_session=${token}`,
    },
    body: JSON.stringify(payload),
  });
  console.log('POST status:', res.status, await res.json());

  console.log('--- 3. GET after ---');
  res = await fetch('http://localhost:3000/api/user/payout-method', {
    headers: { Cookie: `linkearn_session=${token}` },
  });
  console.log('GET after status:', res.status, await res.json());

  console.log('--- 4. Direct DB check ---');
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  console.log('DB payoutDetails in prisma/dev.db:', dbUser?.payoutDetails);

  console.log('--- 5. GET /withdrawals page RSC / HTML check ---');
  const pageRes = await fetch('http://localhost:3000/withdrawals', {
    headers: { Cookie: `linkearn_session=${token}` },
  });
  const html = await pageRes.text();
  console.log('Page status:', pageRes.status);
  console.log('Does HTML contain bank name "State Bank of India"?', html.includes('State Bank of India'));
  console.log('Does HTML contain "Linked Bank Account"?', html.includes('Linked Bank Account'));
  console.log('Does HTML contain "No Bank Account Linked"?', html.includes('No Bank Account Linked'));

  console.log('--- 6. GET /profile page check ---');
  const profileRes = await fetch('http://localhost:3000/profile', {
    headers: { Cookie: `linkearn_session=${token}` },
  });
  const profileHtml = await profileRes.text();
  console.log('Profile page status:', profileRes.status);
  console.log('Does Profile contain bank name "State Bank of India"?', profileHtml.includes('State Bank of India'));
  console.log('Does Profile contain "Connected"?', profileHtml.includes('Connected'));
}

main().catch(console.error);
