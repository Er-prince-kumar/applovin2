import fs from 'fs';
import path from 'path';
import prisma from './prisma';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'payout-methods.json');
const SECONDARY_BACKUP = path.join(process.cwd(), '.payout-backup.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error ensuring payout data directory:', err);
  }
}

interface BackupStore {
  [identifier: string]: any;
}

function readBackupStore(): BackupStore {
  ensureDataDir();
  let merged: BackupStore = {};

  // Read secondary backup first if available
  try {
    if (fs.existsSync(SECONDARY_BACKUP)) {
      const rawSec = fs.readFileSync(SECONDARY_BACKUP, 'utf-8');
      const parsedSec = JSON.parse(rawSec);
      if (parsedSec && typeof parsedSec === 'object') {
        merged = { ...merged, ...parsedSec };
      }
    }
  } catch {}

  // Read primary backup and merge
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const rawPrim = fs.readFileSync(BACKUP_FILE, 'utf-8');
      const parsedPrim = JSON.parse(rawPrim);
      if (parsedPrim && typeof parsedPrim === 'object') {
        merged = { ...merged, ...parsedPrim };
      }
    }
  } catch {}

  return merged;
}

function writeBackupStore(store: BackupStore) {
  ensureDataDir();
  const serialized = JSON.stringify(store, null, 2);

  try {
    fs.writeFileSync(BACKUP_FILE, serialized, 'utf-8');
  } catch (err) {
    console.error('Error writing primary payout backup store:', err);
  }

  try {
    fs.writeFileSync(SECONDARY_BACKUP, serialized, 'utf-8');
  } catch (err) {
    console.error('Error writing secondary payout backup store:', err);
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
