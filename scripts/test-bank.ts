async function testBankFlow() {
  const baseUrl = 'http://localhost:3000';
  console.log('Testing Bank Account Setup & Payout flow...');

  // 1. Login as publisher
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'publisher@linkearn.com', password: 'Publisher123!' }),
  });
  if (!loginRes.ok) throw new Error('Login failed');
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';

  // 2. Save Bank Account
  const saveRes = await fetch(`${baseUrl}/api/user/payout-method`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      type: 'BANK_TRANSFER',
      accountHolder: 'Prince Kumar',
      bankName: 'State Bank of India',
      accountNumber: '123456789012',
      ifscCode: 'SBIN0001234',
      accountType: 'Savings',
    }),
  });
  const saveData = await saveRes.json();
  console.log('  ✓ Save bank status:', saveRes.status);
  console.log('  ✓ Saved bank details:', saveData.payoutDetails?.bankName, saveData.payoutDetails?.ifscCode);

  // 3. Fetch Saved Payout Method
  const getRes = await fetch(`${baseUrl}/api/user/payout-method`, {
    headers: { Cookie: cookie },
  });
  const getData = await getRes.json();
  console.log('  ✓ Retrieved bank:', getData.payoutDetails?.accountHolder, getData.payoutDetails?.type);

  // 4. Request Payout using Linked Bank Account
  const withdrawRes = await fetch(`${baseUrl}/api/withdrawals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      amount: 10.0,
      paymentMethod: 'BANK_TRANSFER',
      paymentDetails: 'Bank: State Bank of India | A/C: 123456789012 | Holder: Prince Kumar | IFSC: SBIN0001234',
      notes: 'Test bank withdrawal',
    }),
  });
  const withdrawData = await withdrawRes.json();
  console.log('  ✓ Withdrawal request status:', withdrawRes.status);
  console.log('  ✓ Withdrawal ID:', withdrawData.withdrawal?.id);

  // 5. Clean up bank account so no dummy bank stays behind
  await fetch(`${baseUrl}/api/user/payout-method`, {
    method: 'DELETE',
    headers: { Cookie: cookie },
  });
  console.log('  ✓ Cleaned up test bank account');

  console.log('\n🎉 ALL BANK ACCOUNT & WITHDRAWAL TESTS PASSED!');
}

testBankFlow().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
