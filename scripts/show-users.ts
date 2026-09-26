import prisma from '../src/lib/prisma';

async function listAllUsers() {
  console.log('\n====================================================');
  console.log('👥 LINKEARN REGISTERED USERS DATABASE');
  console.log('====================================================\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        referralCode: true,
        availableBalance: true,
        lifetimeEarnings: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Total Registered Users: ${users.length}\n`);

    const tableData = users.map((u, i) => ({
      '#': i + 1,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Status: u.status,
      Referral: u.referralCode,
      Balance: `$${u.availableBalance.toFixed(2)}`,
      'Registered At': new Date(u.createdAt).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      }),
    }));

    console.table(tableData);
    console.log('\n📁 Database File Path: c:\\Users\\Prince Singh\\Desktop\\Add\\prisma\\dev.db');
    console.log('🌐 Admin Panel URL:    http://localhost:3000/admin/users\n');
  } catch (err: any) {
    console.error('Error fetching users:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
