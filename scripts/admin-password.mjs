// Creates the values for the admin login environment variables.
//   npm run admin:password             (asks for the password, hidden)
//   npm run admin:password -- "pass"   (password as an argument)
// Prints ADMIN_PASSWORD_HASH and a fresh SESSION_SECRET to paste into Vercel → Settings → Environment Variables.
import { randomBytes, scrypt } from 'node:crypto';
import { createInterface } from 'node:readline';

async function ask(q) {
  if (!process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin });
    for await (const line of rl) { rl.close(); return line; }
    return '';
  }
  process.stdout.write(q);
  return new Promise((res) => {
    let s = '';
    process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.setEncoding('utf8');
    process.stdin.on('data', function on(ch) {
      if (ch === '\r' || ch === '\n' || ch === '\u0004') { process.stdin.setRawMode(false); process.stdin.pause(); process.stdin.off('data', on); process.stdout.write('\n'); res(s); }
      else if (ch === '\u0003') process.exit(1);
      else if (ch === '\u007f' || ch === '\b') s = s.slice(0, -1);
      else s += ch;
    });
  });
}

const password = process.argv[2] ?? await ask('New admin password: ');
if (password.length < 10) { console.error('Use at least 10 characters.'); process.exit(1); }
const N = 2 ** 15, r = 8, p = 1, salt = randomBytes(16);
const key = await new Promise((res, rej) => scrypt(password, salt, 64, { N, r, p, maxmem: 256 * N * r }, (e, k) => (e ? rej(e) : res(k))));
console.log('\nADMIN_PASSWORD_HASH=' + `scrypt:${N}:${r}:${p}:${salt.toString('base64')}:${key.toString('base64')}`);
console.log('SESSION_SECRET=' + randomBytes(32).toString('base64url'));
