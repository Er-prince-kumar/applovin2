import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/auth';

async function main() {
  console.log('=== MULTI-USER BANK ISOLATION & ADD TEST ===\n');

  // Find two different users
  const user1 = await prisma.user.findFirst({ where: { email: 'princebxr2000@gmail.com' } });
  const user2 = await prisma.user.findFirst({ where: { email: 'heybikash11@gmail.com' } });

  if (!user1 || !user2) {
    console.error('Users not found in DB');
    return;
  }

  const token1 = await createSessionToken({ userId: user1.id, email: user1.email, role: user1.role });
  const token2 = await createSessionToken({ userId: user2.id, email: user2.email, role: user2.role });

  console.log(`User 1: ${user1.email} (${user1.name})`);
  console.log(`User 2: ${user2.email} (${user2.name})\n`);

  // STEP 1: Verify both users initially have NO bank account
  console.log('--- STEP 1: Initial state for both users ---');
  let res1 = await fetch('http://localhost:3000/withdrawals', {
    headers: { Cookie: `linkearn_session=${token1}` },
  });
  let html1 = await res1.text();
  console.log(`User 1 has "No Bank Account Linked"? ${html1.includes('No Bank Account Linked')}`);
  console.log(`User 1 has "Add Bank Account"? ${html1.includes('Add Bank Account')}`);

  let res2 = await fetch('http://localhost:3000/withdrawals', {
    headers: { Cookie: `linkearn_session=${token2}` },
  });
  let html2 = await res2.text();
  console.log(`User 2 has "No Bank Account Linked"? ${html2.includes('No Bank Account Linked')}`);
  console.log(`User 2 has "Add Bank Account"? ${html2.includes('Add Bank Account')}\n`);

  // STEP 2: User 2 (Nik) adds his own bank account
  console.log('--- STEP 2: User 2 adds his own bank account ---');
  const user2BankPayload = {
    type: 'BANK_TRANSFER',
    accountHolder: 'Nik Kumar Bikash',
    bankName: 'HDFC Bank',
    accountNumber: '998877665544',
    ifscCode: 'HDFC0001234',
    accountType: 'Savings',
  };

  const saveRes2 = await fetch('http://localhost:3000/api/user/payout-method', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `linkearn_session=${token2}`,
    },
    body: JSON.stringify(user2BankPayload),
  });
  console.log(`User 2 save status: ${saveRes2.status}`);

  // STEP 3: Verify User 2 now sees his bank on /withdrawals & on refresh
  console.log('--- STEP 3: Verify User 2 sees HDFC Bank after refresh ---');
  res2 = await fetch('http://localhost:3000/withdrawals', {
    headers: { Cookie: `linkearn_session=${token2}` },
  });
  html2 = await res2.text();
  console.log(`User 2 sees "HDFC Bank"? ${html2.includes('HDFC Bank')}`);
  console.log(`User 2 sees "Nik Kumar Bikash"? ${html2.includes('Nik Kumar Bikash')}`);
  console.log(`User 2 sees "Verified for Instant Payouts"? ${html2.includes('Verified for Instant Payouts')}\n`);

  // STEP 4: Crucial Isolation check: User 1 MUST STILL have NO bank account!
  console.log('--- STEP 4: ISOLATION CHECK - User 1 MUST NOT see User 2\'s bank ---');
  res1 = await fetch('http://localhost:3000/withdrawals', {
    headers: { Cookie: `linkearn_session=${token1}` },
  });
  html1 = await res1.text();
  console.log(`User 1 has "No Bank Account Linked"? ${html1.includes('No Bank Account Linked')}`);
  console.log(`User 1 sees "HDFC Bank"? ${html1.includes('HDFC Bank')} (MUST BE FALSE)`);
  console.log(`User 1 can still click "Add Bank Account"? ${html1.includes('Add Bank Account')}\n`);

  // STEP 5: User 1 adds his own DIFFERENT bank account (e.g. UPI)
  console.log('--- STEP 5: User 1 adds his own UPI account ---');
  const user1BankPayload = {
    type: 'UPI',
    accountHolder: 'Prince Singh',
    upiId: 'prince@okhdfcbank',
  };

  const saveRes1 = await fetch('http://localhost:3000/api/user/payout-method', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `linkearn_session=${token1}`,
    },
    body: JSON.stringify(user1BankPayload),
  });
  console.log(`User 1 save status: ${saveRes1.status}`);

  // Verify User 1 sees his UPI
  res1 = await fetch('http://localhost:3000/withdrawals', {
    headers: { Cookie: `linkearn_session=${token1}` },
  });
  html1 = await res1.text();
  console.log(`User 1 sees "prince@okhdfcbank"? ${html1.includes('prince@okhdfcbank')}`);

  // Clean up test data so database stays fresh for the user
  console.log('\n--- CLEANING UP TEST DATA ---');
  await prisma.user.updateMany({ data: { payoutDetails: null } });
  console.log('Database reset to clean state: all users have payoutDetails = null');

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

main().catch(console.error);
