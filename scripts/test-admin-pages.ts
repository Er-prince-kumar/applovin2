import { createSessionToken } from '../src/lib/auth';
import prisma from '../src/lib/prisma';

async function testAdminPages() {
  const admin = await prisma.user.findUnique({
    where: { email: 'princebxr2000@gmail.com' },
  });

  if (!admin) {
    console.error('Admin user not found!');
    return;
  }

  const token = await createSessionToken({
    userId: admin.id,
    email: admin.email,
    role: admin.role,
  });

  console.log('Admin token generated. Testing requests...');

  // Test /admin/withdrawals
  const resWithdrawals = await fetch('http://localhost:3000/admin/withdrawals', {
    headers: {
      Cookie: `linkearn_session=${token}`,
    },
  });

  const textWithdrawals = await resWithdrawals.text();
  console.log('/admin/withdrawals status:', resWithdrawals.status);
  console.log('Contains nik98765@paytm?', textWithdrawals.includes('nik98765@paytm'));
  console.log('Contains Nik?', textWithdrawals.includes('Nik'));

  // Test /admin/users
  const resUsers = await fetch('http://localhost:3000/admin/users', {
    headers: {
      Cookie: `linkearn_session=${token}`,
    },
  });

  const textUsers = await resUsers.text();
  console.log('/admin/users status:', resUsers.status);
  console.log('Contains nik98765@paytm in /admin/users?', textUsers.includes('nik98765@paytm'));
}

testAdminPages().finally(() => prisma.$disconnect());
