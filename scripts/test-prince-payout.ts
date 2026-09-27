import prisma from '../src/lib/prisma';
import { createSessionToken } from '../src/lib/auth';

async function testSaveForPrince() {
  const user = await prisma.user.findUnique({
    where: { email: 'princebxr2000@gmail.com' },
  });

  if (!user) {
    console.error('Prince not found');
    return;
  }

  console.log('Prince ID:', user.id);
  console.log('Current payoutDetails:', user.payoutDetails);

  // Simulate updating Prince's payout details directly
  const dummyBank = {
    type: 'BANK_TRANSFER',
    accountHolder: 'Prince Kumar',
    bankName: 'State Bank of India',
    accountNumber: '123456789012',
    ifscCode: 'SBIN0001234',
    accountType: 'Savings',
    updatedAt: new Date().toISOString(),
  };

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      payoutDetails: JSON.stringify(dummyBank),
    },
    select: { id: true, payoutDetails: true },
  });

  console.log('Updated payoutDetails:', updated.payoutDetails);

  // Now verify that reading it returns it
  const readBack = await prisma.user.findUnique({
    where: { id: user.id },
    select: { payoutDetails: true },
  });

  console.log('Read back:', readBack?.payoutDetails);
  await prisma.$disconnect();
}

testSaveForPrince();
