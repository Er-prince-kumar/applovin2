import prisma from '../src/lib/prisma';

async function listPayoutInformation() {
  console.log('\n====================================================');
  console.log('💳 LINKEARN PAYMENT & WITHDRAWAL INFORMATION');
  console.log('====================================================\n');

  try {
    // 1. Fetch user-saved payment profiles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        payoutDetails: true,
        availableBalance: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const usersWithPayout = users.filter((u) => u.payoutDetails !== null);

    console.log(`📌 User Payment / UPI Profiles (${usersWithPayout.length} linked / ${users.length} total users):\n`);
    if (usersWithPayout.length === 0) {
      console.log('   (No user has saved a default payout method in their profile yet)\n');
    } else {
      const profileData = usersWithPayout.map((u, i) => {
        let details: any = {};
        try {
          details = JSON.parse(u.payoutDetails || '{}');
        } catch {
          details = { raw: u.payoutDetails };
        }

        let paymentDestination = '';
        if (details.type === 'UPI') {
          paymentDestination = `UPI: ${details.upiId}`;
        } else if (details.type === 'BANK_TRANSFER') {
          paymentDestination = `${details.bankName || 'Bank'} A/C: ${details.accountNumber} (IFSC: ${details.ifscCode})`;
        } else if (details.type === 'CRYPTO_USDT') {
          paymentDestination = `USDT: ${details.usdtAddress}`;
        } else {
          paymentDestination = details.upiId || details.accountNumber || JSON.stringify(details);
        }

        return {
          '#': i + 1,
          Name: u.name,
          Email: u.email,
          Method: details.type || 'UNKNOWN',
          'Payment Destination / UPI ID': paymentDestination,
          'Account Holder': details.accountHolder || u.name,
          Balance: `$${u.availableBalance.toFixed(2)}`,
        };
      });
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

    console.log(`\n💰 Withdrawal Requests Queue (${withdrawals.length} cashout requests):\n`);
    if (withdrawals.length === 0) {
      console.log('   (No withdrawal cashout requests submitted yet)\n');
    } else {
      const withdrawalData = withdrawals.map((w, i) => ({
        '#': i + 1,
        Publisher: `${w.user.name} (${w.user.email})`,
        Amount: `$${w.amount.toFixed(2)}`,
        Method: w.paymentMethod,
        'Target Info': w.paymentDetails,
        Status: w.status,
        Date: new Date(w.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      }));
      console.table(withdrawalData);
    }

    // 3. All registered users summary
    console.log(`\n👥 All Registered Users (${users.length} users):`);
    const allUsersTable = users.map((u, i) => ({
      '#': i + 1,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      'Payment Status': u.payoutDetails ? '✅ LINKED' : '❌ NOT LINKED',
    }));
    console.table(allUsersTable);

    console.log('----------------------------------------------------');
    console.log('📁 Database File Path: c:\\Users\\Prince Singh\\Desktop\\Add\\prisma\\dev.db');
    console.log('🌐 Admin Payouts Queue: http://localhost:3000/admin/withdrawals');
    console.log('🌐 Admin Users List: http://localhost:3000/admin/users');
    console.log('====================================================\n');
  } catch (err: any) {
    console.error('Error fetching payout details:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

listPayoutInformation();
