import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL?.trim();

  // If remote database connection provided (e.g. PostgreSQL, Supabase, Neon, MySQL)
  if (envUrl && !envUrl.startsWith('file:') && envUrl !== '') {
    return envUrl;
  }

  // Handle Vercel / AWS Lambda / Serverless read-only filesystem
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const tmpDbPath = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const candidatePaths = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
          path.join('/var/task', 'prisma', 'dev.db'),
        ];

        let copied = false;
        for (const candidate of candidatePaths) {
          if (fs.existsSync(candidate)) {
            fs.copyFileSync(candidate, tmpDbPath);
            copied = true;
            break;
          }
        }

        if (!copied) {
          fs.writeFileSync(tmpDbPath, '');
        }
      }
    } catch (err) {
      console.warn('Notice: Serverless /tmp database setup:', err);
    }

    return `file:${tmpDbPath}`;
  }

  // Local development / server environment
  const localDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDbPath.replace(/\\/g, '/')}`;
}

const resolvedDatabaseUrl = getDatabaseUrl();
process.env.DATABASE_URL = resolvedDatabaseUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDatabaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
