import fs from 'fs';
import path from 'path';
import os from 'os';
import prisma from './prisma';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PRIMARY_BACKUP_FILE = path.join(DATA_DIR, 'earnings.json');
const SECONDARY_BACKUP_FILE = path.join(process.cwd(), '.earnings-backup.json');
const SYSTEM_BACKUP_DIR = path.join(os.homedir(), '.linkearn-storage');
const SYSTEM_BACKUP_FILE = path.join(SYSTEM_BACKUP_DIR, 'earnings.json');
const TMP_BACKUP_FILE = path.join(os.tmpdir(), 'linkearn-earnings.json');

export interface UserEarningsBackup {
  availableBalance: number;
  lifetimeEarnings: number;
  pendingBalance?: number;
  totalWithdrawn?: number;
  adsWatchedToday?: number;
  adsWatchedDate?: string;
  todayEarnings?: number;
  todayEarningsDate?: string;
  updatedAt: number;
}

interface BackupStore {
  [identifier: string]: UserEarningsBackup;
}

function ensureDataDirs() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // ignore
  }
  try {
    if (!fs.existsSync(SYSTEM_BACKUP_DIR)) {
      fs.mkdirSync(SYSTEM_BACKUP_DIR, { recursive: true });
    }
  } catch (err) {
    // ignore
  }
}

function mergeStoreFromFile(filePath: string, targetStore: BackupStore) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        for (const [key, val] of Object.entries(parsed)) {
          const entry = val as UserEarningsBackup;
          if (entry && typeof entry.availableBalance === 'number') {
            const existing = targetStore[key];
            if (!existing || (entry.updatedAt || 0) >= (existing.updatedAt || 0)) {
              targetStore[key] = entry;
            }
          }
        }
      }
    }
  } catch (e) {
    // ignore parse error
  }
}

export function readEarningsStore(): BackupStore {
  ensureDataDirs();
  const merged: BackupStore = {};

  // 1. Read from system-level homedir storage (immune to any git pull or code changes)
  mergeStoreFromFile(SYSTEM_BACKUP_FILE, merged);

  // 2. Read secondary gitignored workspace backup
  mergeStoreFromFile(SECONDARY_BACKUP_FILE, merged);

  // 3. Read primary project data backup
  mergeStoreFromFile(PRIMARY_BACKUP_FILE, merged);

  // 4. Read tmp backup (useful in serverless environments)
  mergeStoreFromFile(TMP_BACKUP_FILE, merged);

  return merged;
}

export function writeEarningsStore(store: BackupStore) {
  ensureDataDirs();
  const serialized = JSON.stringify(store, null, 2);

  // 1. System homedir storage
  try {
    fs.writeFileSync(SYSTEM_BACKUP_FILE, serialized, 'utf-8');
  } catch {}

  // 2. Secondary workspace backup
  try {
    fs.writeFileSync(SECONDARY_BACKUP_FILE, serialized, 'utf-8');
  } catch {}

  // 3. Primary workspace backup
  try {
    fs.writeFileSync(PRIMARY_BACKUP_FILE, serialized, 'utf-8');
  } catch {}

  // 4. Tmp backup
  try {
    fs.writeFileSync(TMP_BACKUP_FILE, serialized, 'utf-8');
  } catch {}
}

/**
 * Persist user earnings and balance into multi-tier permanent storage
 */
export function saveBalanceBackup(
  userId: string,
  email: string | undefined,
  data: {
    availableBalance: number;
    lifetimeEarnings?: number;
    pendingBalance?: number;
    totalWithdrawn?: number;
    adsWatchedToday?: number;
    adsWatchedDate?: string;
    todayEarnings?: number;
    todayEarningsDate?: string;
  }
) {
  const store = readEarningsStore();
  const existing = store[userId] || (email ? store[email.toLowerCase()] : undefined);

  const now = Date.now();
  const todayDateStr = new Date().toISOString().split('T')[0];

  const newEntry: UserEarningsBackup = {
    availableBalance: Number(data.availableBalance.toFixed(4)),
    lifetimeEarnings: Number(
      (data.lifetimeEarnings !== undefined
        ? data.lifetimeEarnings
        : Math.max(existing?.lifetimeEarnings || 0, data.availableBalance)
      ).toFixed(4)
    ),
    pendingBalance: data.pendingBalance !== undefined ? data.pendingBalance : existing?.pendingBalance || 0,
    totalWithdrawn: data.totalWithdrawn !== undefined ? data.totalWithdrawn : existing?.totalWithdrawn || 0,
    adsWatchedToday:
      data.adsWatchedToday !== undefined
        ? data.adsWatchedToday
        : existing?.adsWatchedDate === todayDateStr
        ? existing.adsWatchedToday
        : 0,
    adsWatchedDate: data.adsWatchedDate || existing?.adsWatchedDate || todayDateStr,
    todayEarnings:
      data.todayEarnings !== undefined
        ? data.todayEarnings
        : existing?.todayEarningsDate === todayDateStr
        ? existing.todayEarnings
        : undefined,
    todayEarningsDate: data.todayEarningsDate || existing?.todayEarningsDate || todayDateStr,
    updatedAt: now,
  };

  store[userId] = newEntry;
  if (email) {
    store[email.toLowerCase()] = newEntry;
  }

  writeEarningsStore(store);
  return newEntry;
}

/**
 * Retrieve user earnings and balance from permanent storage
 */
export function getBalanceBackup(userId: string, email?: string): UserEarningsBackup | null {
  const store = readEarningsStore();
  if (store[userId]) return store[userId];
  if (email && store[email.toLowerCase()]) return store[email.toLowerCase()];
  return null;
}

/**
 * Ensure database has the latest balance by self-healing from backup if DB is 0 or lower than backup
 */
export async function ensureBalancePersisted(
  userId: string,
  email: string | undefined,
  currentDbBalance: number,
  currentDbLifetime: number
): Promise<{ availableBalance: number; lifetimeEarnings: number } | null> {
  try {
    const backup = getBalanceBackup(userId, email);
    if (!backup) {
      if (currentDbBalance > 0 || currentDbLifetime > 0) {
        saveBalanceBackup(userId, email, {
          availableBalance: currentDbBalance,
          lifetimeEarnings: currentDbLifetime,
        });
      }
      return null;
    }

    const targetBalance = Math.max(backup.availableBalance, currentDbBalance);
    const targetLifetime = Math.max(backup.lifetimeEarnings, currentDbLifetime, targetBalance);

    if (targetBalance > currentDbBalance || targetLifetime > currentDbLifetime) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            availableBalance: targetBalance,
            lifetimeEarnings: targetLifetime,
          },
        });
      } catch (dbErr) {
        // Ephemeral database might be locked or read-only on some serverless hosts; still return the target balance
      }

      return {
        availableBalance: targetBalance,
        lifetimeEarnings: targetLifetime,
      };
    }

    return null;
  } catch (err) {
    console.error('Error ensuring balance persisted:', err);
    return null;
  }
}
