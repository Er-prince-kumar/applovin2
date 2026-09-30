import fs from 'fs';
import path from 'path';
import os from 'os';
import prisma from './prisma';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'linkearn-production-secure-auth-secret-key-32-chars-min'
);

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PRIMARY_BACKUP_FILE = path.join(DATA_DIR, 'users.json');
const SECONDARY_BACKUP_FILE = path.join(process.cwd(), '.users-backup.json');
const SYSTEM_BACKUP_DIR = path.join(os.homedir(), '.linkearn-storage');
const SYSTEM_BACKUP_FILE = path.join(SYSTEM_BACKUP_DIR, 'users.json');
const TMP_BACKUP_FILE = path.join(os.tmpdir(), 'linkearn-users.json');

export interface UserBackupRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  status: string;
  referralCode: string;
  referredById: string | null;
  availableBalance?: number;
  lifetimeEarnings?: number;
  updatedAt: number;
}

interface UserBackupStore {
  [identifier: string]: UserBackupRecord;
}

let cachedUserStore: UserBackupStore | null = null;
let lastUserCacheTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds in-memory cache to keep server blazing fast

function ensureDataDirs() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
  try {
    if (!fs.existsSync(SYSTEM_BACKUP_DIR)) {
      fs.mkdirSync(SYSTEM_BACKUP_DIR, { recursive: true });
    }
  } catch {}
}

function mergeStoreFromFile(filePath: string, targetStore: UserBackupStore) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        for (const [key, val] of Object.entries(parsed)) {
          const entry = val as UserBackupRecord;
          if (entry && entry.email && entry.passwordHash) {
            const existing = targetStore[key];
            if (!existing || (entry.updatedAt || 0) >= (existing.updatedAt || 0)) {
              targetStore[key] = entry;
            }
          }
        }
      }
    }
  } catch {}
}

export function readUserStore(): UserBackupStore {
  const now = Date.now();
  if (cachedUserStore && now - lastUserCacheTime < CACHE_TTL_MS) {
    return cachedUserStore;
  }

  ensureDataDirs();
  const merged: UserBackupStore = {};

  // 1. System homedir backup (immune to code checkouts/pulls)
  mergeStoreFromFile(SYSTEM_BACKUP_FILE, merged);

  // 2. Secondary workspace backup
  mergeStoreFromFile(SECONDARY_BACKUP_FILE, merged);

  // 3. Primary project data backup
  mergeStoreFromFile(PRIMARY_BACKUP_FILE, merged);

  // 4. Tmp storage
  mergeStoreFromFile(TMP_BACKUP_FILE, merged);

  cachedUserStore = merged;
  lastUserCacheTime = now;
  return merged;
}

export function writeUserStore(store: UserBackupStore) {
  ensureDataDirs();
  cachedUserStore = store;
  lastUserCacheTime = Date.now();

  const serialized = JSON.stringify(store, null, 2);

  try {
    fs.writeFileSync(SYSTEM_BACKUP_FILE, serialized, 'utf-8');
  } catch {}

  try {
    fs.writeFileSync(SECONDARY_BACKUP_FILE, serialized, 'utf-8');
  } catch {}

  try {
    fs.writeFileSync(PRIMARY_BACKUP_FILE, serialized, 'utf-8');
  } catch {}

  try {
    fs.writeFileSync(TMP_BACKUP_FILE, serialized, 'utf-8');
  } catch {}
}

/**
 * Persist user account into permanent multi-tier file storage
 */
export function saveUserBackup(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
  status?: string;
  referralCode: string;
  referredById?: string | null;
  availableBalance?: number;
  lifetimeEarnings?: number;
}) {
  const store = readUserStore();
  const normalizedEmail = user.email.toLowerCase().trim();

  const record: UserBackupRecord = {
    id: user.id,
    name: user.name.trim(),
    email: normalizedEmail,
    passwordHash: user.passwordHash,
    role: user.role || 'USER',
    status: user.status || 'ACTIVE',
    referralCode: user.referralCode,
    referredById: user.referredById || null,
    availableBalance: user.availableBalance || 0,
    lifetimeEarnings: user.lifetimeEarnings || 0,
    updatedAt: Date.now(),
  };

  store[user.id] = record;
  store[normalizedEmail] = record;

  writeUserStore(store);
  return record;
}

/**
 * Retrieve user backup by ID or email
 */
export function getUserBackup(identifier: string): UserBackupRecord | null {
  if (!identifier) return null;
  const store = readUserStore();
  const clean = identifier.toLowerCase().trim();
  if (store[clean]) return store[clean];
  if (store[identifier]) return store[identifier];
  return null;
}

/**
 * Create a cryptographically signed user vault token (valid for 365 days)
 * This allows user resurrection across isolated serverless lambdas with zero database loss
 */
export async function createUserVaultToken(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  referralCode: string;
  referredById?: string | null;
}): Promise<string> {
  return new SignJWT({
    userId: user.id,
    name: user.name,
    email: user.email.toLowerCase().trim(),
    passwordHash: user.passwordHash,
    role: user.role,
    referralCode: user.referralCode,
    referredById: user.referredById || null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(JWT_SECRET);
}

/**
 * Verify a user vault token
 */
export async function verifyUserVaultToken(token: string): Promise<UserBackupRecord | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload?.email || !payload?.passwordHash) return null;
    return {
      id: (payload.userId as string) || (payload.id as string),
      name: (payload.name as string) || 'Publisher',
      email: (payload.email as string).toLowerCase().trim(),
      passwordHash: payload.passwordHash as string,
      role: (payload.role as string) || 'USER',
      status: 'ACTIVE',
      referralCode: (payload.referralCode as string) || 'REF001',
      referredById: (payload.referredById as string) || null,
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Recreate / upsert a user into the active SQLite database instance
 */
export async function resurrectUserIntoDb(backup: UserBackupRecord) {
  try {
    return await prisma.user.upsert({
      where: { email: backup.email.toLowerCase().trim() },
      update: {
        passwordHash: backup.passwordHash,
        name: backup.name,
        role: backup.role,
        status: backup.status,
      },
      create: {
        id: backup.id,
        name: backup.name,
        email: backup.email.toLowerCase().trim(),
        passwordHash: backup.passwordHash,
        role: backup.role,
        status: backup.status,
        referralCode: backup.referralCode,
        referredById: backup.referredById,
        availableBalance: backup.availableBalance || 0,
        lifetimeEarnings: backup.lifetimeEarnings || 0,
      },
    });
  } catch (err) {
    console.error('Error resurrecting user into database:', err);
    return null;
  }
}
