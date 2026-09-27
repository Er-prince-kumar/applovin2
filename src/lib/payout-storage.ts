import fs from 'fs';
import path from 'path';
import prisma from './prisma';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'payout-methods.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUP_FILE)) {
      fs.writeFileSync(BACKUP_FILE, JSON.stringify({}, null, 2), 'utf-8');
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
  try {
    const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

function writeBackupStore(store: BackupStore) {
  ensureDataDir();
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing payout backup store:', err);
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
