import fs from 'fs';
import path from 'path';
import os from 'os';
import prisma from './prisma';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'payout-methods.json');
const SECONDARY_BACKUP = path.join(process.cwd(), '.payout-backup.json');
const SYSTEM_BACKUP_DIR = path.join(os.homedir(), '.linkearn-storage');
const SYSTEM_BACKUP_FILE = path.join(SYSTEM_BACKUP_DIR, 'payout-methods.json');

function ensureDataDirs() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error ensuring payout data directory:', err);
  }
  try {
    if (!fs.existsSync(SYSTEM_BACKUP_DIR)) {
      fs.mkdirSync(SYSTEM_BACKUP_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error ensuring system payout directory:', err);
  }
}

interface BackupStore {
  [identifier: string]: any;
}

let cachedPayoutStore: BackupStore | null = null;
let lastPayoutCacheTime = 0;
const CACHE_TTL_MS = 10000; // 10s in-memory cache to keep server blazing fast

function readBackupStore(): BackupStore {
  const now = Date.now();
  if (cachedPayoutStore && now - lastPayoutCacheTime < CACHE_TTL_MS) {
    return cachedPayoutStore;
  }

  ensureDataDirs();
  let merged: BackupStore = {};

  // 1. Read from system-level homedir storage (immune to any git checkout, git pull, or code changes)
  try {
    if (fs.existsSync(SYSTEM_BACKUP_FILE)) {
      const rawSys = fs.readFileSync(SYSTEM_BACKUP_FILE, 'utf-8');
      const parsedSys = JSON.parse(rawSys);
      if (parsedSys && typeof parsedSys === 'object') {
        merged = { ...merged, ...parsedSys };
      }
    }
  } catch {}

  // 2. Read secondary gitignored workspace backup
  try {
    if (fs.existsSync(SECONDARY_BACKUP)) {
      const rawSec = fs.readFileSync(SECONDARY_BACKUP, 'utf-8');
      const parsedSec = JSON.parse(rawSec);
      if (parsedSec && typeof parsedSec === 'object') {
        merged = { ...merged, ...parsedSec };
      }
    }
  } catch {}

  // 3. Read primary project backup
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const rawPrim = fs.readFileSync(BACKUP_FILE, 'utf-8');
      const parsedPrim = JSON.parse(rawPrim);
      if (parsedPrim && typeof parsedPrim === 'object') {
        merged = { ...merged, ...parsedPrim };
      }
    }
  } catch {}

  cachedPayoutStore = merged;
  lastPayoutCacheTime = now;
  return merged;
}

function writeBackupStore(store: BackupStore) {
  ensureDataDirs();
  cachedPayoutStore = store;
  lastPayoutCacheTime = Date.now();

  const serialized = JSON.stringify(store, null, 2);

  // 1. System homedir storage (indestructible across code updates)
  try {
    fs.writeFileSync(SYSTEM_BACKUP_FILE, serialized, 'utf-8');
  } catch (err) {
    console.error('Error writing system payout backup:', err);
  }

  // 2. Secondary gitignored workspace backup
  try {
    fs.writeFileSync(SECONDARY_BACKUP, serialized, 'utf-8');
  } catch (err) {
    console.error('Error writing secondary payout backup store:', err);
  }

  // 3. Primary workspace backup
  try {
    fs.writeFileSync(BACKUP_FILE, serialized, 'utf-8');
  } catch (err) {
    console.error('Error writing primary payout backup store:', err);
  }
}

/**
 * Persist bank/UPI payout details into permanent file storage
 */
export function savePayoutBackup(userId: string, email: string, details: any) {
  const store = readBackupStore();
  store[userId] = details;
  if (email) {
    store[email.toLowerCase()] = details;
  }
  writeBackupStore(store);
}

/**
 * Retrieve bank/UPI payout details from permanent file storage
 */
export function getPayoutBackup(userId: string, email?: string): any | null {
  const store = readBackupStore();
  if (store[userId]) return store[userId];
  if (email && store[email.toLowerCase()]) return store[email.toLowerCase()];
  return null;
}

/**
 * Delete bank details from backup store
 */
export function deletePayoutBackup(userId: string, email?: string) {
  const store = readBackupStore();
  delete store[userId];
  if (email) {
    delete store[email.toLowerCase()];
  }
  writeBackupStore(store);
}

/**
 * Ensure database has the latest payout details by self-healing from backup if DB is null
 */
export async function ensurePayoutDetailsPersisted(
  userId: string,
  email: string,
  currentDbDetails: string | null
): Promise<string | null> {
  // If DB already has it, update the file backup to keep in sync
  if (currentDbDetails) {
    try {
      const parsed = JSON.parse(currentDbDetails);
      savePayoutBackup(userId, email, parsed);
    } catch {}
    return currentDbDetails;
  }

  // If DB lost it (due to code update, git reset, or dev db replacement), restore from file backup!
  const backup = getPayoutBackup(userId, email);
  if (backup) {
    const serialized = JSON.stringify(backup);
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { payoutDetails: serialized },
      });
      console.log(`🛡️ [Self-Heal] Restored lost payout details for user ${email} from permanent backup.`);
    } catch (err) {
      console.warn('Could not auto-restore payout details to DB:', err);
    }
    return serialized;
  }

  return null;
}
