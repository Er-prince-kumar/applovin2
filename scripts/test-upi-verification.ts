import prisma from '../src/lib/prisma';

async function main() {
  console.log('Testing UPI save & display...');
  
  // Find Nik (heybikash11@gmail.com)
  const nik = await prisma.user.findUnique({
    where: { email: 'heybikash11@gmail.com' },
  });

  if (!nik) {
    console.error('User heybikash11@gmail.com not found in DB!');
    return;
  }

  // Simulate Nik adding their UPI ID in app
  const upiDetails = {
    type: 'UPI',
    upiId: 'nik98765@paytm',
    accountHolder: 'Nik Kumar',
    updatedAt: new Date().toISOString(),
  };

  await prisma.user.update({
    where: { id: nik.id },
    data: {
      payoutDetails: JSON.stringify(upiDetails),
    },
  });

  console.log('Successfully saved UPI for Nik (heybikash11@gmail.com)!');
}

main().finally(() => prisma.$disconnect());
