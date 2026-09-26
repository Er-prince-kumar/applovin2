import prisma from '../src/lib/prisma';

async function listPayoutInformation() {
  console.log('\n====================================================');
  console.log('💳 LINKEARN PAYMENT & WITHDRAWAL INFORMATION');
  console.log('====================================================\n');

  try {
    // 1. Fetch user-saved payment profiles
    const usersWithPayout = await prisma.user.findMany({
      where: {
        payoutDetails: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        payoutDetails: true,
        availableBalance: true,
      },
    });

    console.log(`📌 Saved User Payment Profiles (${usersWithPayout.length} users configured):\n`);
    if (usersWithPayout.length === 0) {
      console.log('   (No user has saved a default payout method in their profile yet)\n');
    } else {
      const profileData = usersWithPayout.map((u, i) => ({
        '#': i + 1,
        Name: u.name,
        Email: u.email,
        'Saved Payment Details': u.payoutDetails,
        Balance: `$${u.availableBalance.toFixed(2)}`,
      }));
      console.table(profileData);
    }

    // 2. Fetch withdrawal requests
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`\n💰 Withdrawal Requests Queue (${withdrawals.length} requests found):\n`);
    if (withdrawals.length === 0) {
      console.log('   (No withdrawal requests submitted yet)\n');
    } else {
      const withdrawalData = withdrawals.map((w, i) => ({
        '#': i + 1,
        Publisher: `${w.user.name} (${w.user.email})`,
        Amount: `$${w.amount.toFixed(2)}`,
        Method: w.paymentMethod,
        'Payment Information (Target)': w.paymentDetails,
        Status: w.status,
        Date: new Date(w.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      }));
      console.table(withdrawalData);
    }

    console.log('----------------------------------------------------');
    console.log('📁 Database File Path: c:\\Users\\Prince Singh\\Desktop\\Add\\prisma\\dev.db');
    console.log('🌐 Admin Payouts Queue: http://localhost:3000/admin/withdrawals');
    console.log('====================================================\n');
  } catch (err: any) {
    console.error('Error fetching payout details:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

listPayoutInformation();
