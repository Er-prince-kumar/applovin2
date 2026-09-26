import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const WORKSPACE_DIR = process.cwd();
const DEBOUNCE_MS = 4000; // Wait 4 seconds after last file change before committing & pushing

const IGNORED_DIRS = new Set([
  '.git',
  '.next',
  'node_modules',
  '.system_generated',
  '.gemini',
  'build',
  'dist',
  'out',
  '.gradle',
]);

const VALID_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.html',
  '.json',
  '.md',
  '.svg',
  '.png',
  '.jpg',
  '.webp',
  '.ico',
  '.xml',
  '.gradle',
  '.properties',
]);

let changeTimeout: NodeJS.Timeout | null = null;
let changedFilesSet = new Set<string>();
let isSyncing = false;

function shouldIgnore(filePath: string): boolean {
  const relative = path.relative(WORKSPACE_DIR, filePath);
  const parts = relative.split(path.sep);

  for (const part of parts) {
    if (IGNORED_DIRS.has(part)) return true;
    if (part.startsWith('.') && part !== '.env.example' && part !== '.gitignore') return true;
  }

  // If path is a directory, don't trigger sync
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      return true;
    }
  } catch {
    // File may have been deleted
  }

  const ext = path.extname(filePath).toLowerCase();
  if (filePath.includes('dev.db') || filePath.includes('.db-journal') || filePath.includes('.db-wal')) {
    return true;
  }

  if (!VALID_EXTENSIONS.has(ext) && !filePath.endsWith('.gitignore')) {
    return true;
  }

  return false;
}

function getGitBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim() || 'main';
  } catch {
    return 'main';
  }
}

function hasGitRemote(): boolean {
  try {
    const remotes = execSync('git remote', { encoding: 'utf8' }).trim();
    return remotes.split('\n').map((r) => r.trim()).includes('origin');
  } catch {
    return false;
  }
}

function getRemoteUrl(): string | null {
  try {
    return execSync('git remote get-url origin', { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

async function performSync() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // 1. Check git status
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' }).trim();

    if (!statusOutput) {
      // No uncommitted changes
      isSyncing = false;
      changedFilesSet.clear();
      return;
    }

    const modifiedList = Array.from(changedFilesSet).slice(0, 3);
    const summary = modifiedList.length > 0 ? modifiedList.join(', ') : 'project files';
    const timestamp = new Date().toLocaleTimeString();
    const commitMessage = `Auto-update: ${summary} (${timestamp})`;

    console.log(`\n🔄 [Auto-Sync] Detected changes. Staging files...`);
    execSync('git add -A', { stdio: 'inherit' });

    console.log(`📝 [Auto-Sync] Committing: "${commitMessage}"`);
    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });

    // 2. Check if Capacitor Android sync is relevant
    const hasSrcChanges = Array.from(changedFilesSet).some((f) => f.startsWith('src') || f.startsWith('public'));
    if (hasSrcChanges) {
      try {
        console.log(`📱 [Auto-Sync] Syncing changes to Android project (cap sync)...`);
        execSync('npx cap sync android', { stdio: 'pipe' });
        console.log(`✅ [Auto-Sync] Android native project synchronized!`);
      } catch (capErr) {
        // Non-blocking Capacitor sync
      }
    }

    // 3. Push to GitHub if remote exists
    const branch = getGitBranch();
    if (hasGitRemote()) {
      const remoteUrl = getRemoteUrl();
      console.log(`🚀 [Auto-Sync] Uploading changes to GitHub (${remoteUrl}, branch: ${branch})...`);
      try {
        execSync(`git push origin ${branch}`, { stdio: 'inherit' });
        console.log(`🎉 [Auto-Sync] SUCCESS: All changes live on GitHub!`);
      } catch (pushErr: any) {
        console.error(`⚠️ [Auto-Sync] Push failed. Make sure you have push access or set up credentials:`, pushErr.message);
      }
    } else {
      console.log(`\n📌 [Auto-Sync] Changes committed locally!`);
      console.log(`👉 To automatically upload to your GitHub repository, connect your GitHub URL:`);
      console.log(`   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git`);
      console.log(`   git push -u origin ${branch}`);
      console.log(`   (Or run: npm run git:remote -- https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git)\n`);
    }
  } catch (err: any) {
    console.error(`[Auto-Sync Error]:`, err.message);
  } finally {
    changedFilesSet.clear();
    isSyncing = false;
  }
}

function handleFileChange(eventType: string, filename: string | null) {
  if (!filename) return;

  const fullPath = path.resolve(WORKSPACE_DIR, filename);
  if (shouldIgnore(fullPath)) return;

  const relative = path.relative(WORKSPACE_DIR, fullPath);
  changedFilesSet.add(path.basename(relative));

  console.log(`⚡ [Auto-Sync] File modified: ${relative}`);

  if (changeTimeout) {
    clearTimeout(changeTimeout);
  }

  changeTimeout = setTimeout(() => {
    performSync();
  }, DEBOUNCE_MS);
}

console.log('====================================================');
console.log('🚀 LINKEARN AUTOMATIC LIVE CODE & GITHUB SYNC WATCHER');
console.log('====================================================');
console.log(`📁 Watching directory: ${WORKSPACE_DIR}`);
console.log(`🌿 Current Git branch: ${getGitBranch()}`);

if (hasGitRemote()) {
  console.log(`🔗 GitHub Remote URL: ${getRemoteUrl()}`);
  console.log('✨ Any code edit will be automatically committed and pushed to GitHub!');
} else {
  console.log('⚠️  No GitHub remote configured yet.');
  console.log('👉 To link your GitHub repo:');
  console.log('   npm run git:remote -- https://github.com/YOUR_USERNAME/YOUR_REPO.git\n');
}

console.log('👀 Watching for file changes (saving any file triggers auto-sync)...');

try {
  fs.watch(WORKSPACE_DIR, { recursive: true }, handleFileChange);
} catch (e: any) {
  console.error('File watcher error:', e.message);
}
