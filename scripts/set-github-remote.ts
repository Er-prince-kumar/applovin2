import { execSync } from 'child_process';

const repoUrl = process.argv[2];

if (!repoUrl) {
  console.log('Usage: npm run git:remote -- https://github.com/USERNAME/REPOSITORY.git');
  process.exit(1);
}

try {
  // Check if origin already exists
  let hasOrigin = false;
  try {
    const remotes = execSync('git remote', { encoding: 'utf8' });
    hasOrigin = remotes.includes('origin');
  } catch {}

  if (hasOrigin) {
    execSync(`git remote set-url origin ${repoUrl}`, { stdio: 'inherit' });
    console.log(`✅ Updated existing GitHub remote 'origin' to: ${repoUrl}`);
  } else {
    execSync(`git remote add origin ${repoUrl}`, { stdio: 'inherit' });
    console.log(`✅ Added GitHub remote 'origin': ${repoUrl}`);
  }

  // Push main branch to origin
  console.log(`🚀 Uploading project files to GitHub repo...`);
  execSync(`git push -u origin main`, { stdio: 'inherit' });
  console.log(`🎉 SUCCESS: Code has been uploaded to GitHub!`);
} catch (err: any) {
  console.error(`⚠️ Git command error:`, err.message);
  console.log(`\nNote: If GitHub asks for authentication, configure your Git Personal Access Token or SSH key:`);
  console.log(`  git push -u origin main`);
}
