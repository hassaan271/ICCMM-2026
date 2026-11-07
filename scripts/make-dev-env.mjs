// Writes a git-ignored .env.local with a random test admin login for local development (CMS_STORAGE=local).
// The test password is written into .env.local as a comment.
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';

if (existsSync('.env.local')) { console.log('.env.local already exists; left unchanged.'); process.exit(0); }
const pw = randomBytes(9).toString('base64url');
const out = execFileSync(process.execPath, ['scripts/admin-password.mjs', pw], { encoding: 'utf8' });
const lines = out.split('\n').filter((l) => l.includes('='));
writeFileSync('.env.local', [
  '# Local development only (git-ignored). Test admin login for http://localhost:5173/admin',
  `# Test password: ${pw}`,
  'ADMIN_USERNAME=admin@iccmm.test',
  ...lines,
  'CMS_STORAGE=local',
  '',
].join('\n'));
console.log('Wrote .env.local (username admin@iccmm.test; the password is in the file).');
