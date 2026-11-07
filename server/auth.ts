// Admin authentication: one admin account from environment variables, scrypt password hash,
// HMAC-signed session cookie (HttpOnly, SameSite=Strict, Path=/api/admin) and a per-session CSRF token.
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

const COOKIE = 'iccmm_admin';
const SESSION_HOURS = 8;

export type Session = { user: string; sid: string; exp: number };

export function authConfig() {
  const user = process.env.ADMIN_USERNAME?.trim();
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const secret = process.env.SESSION_SECRET?.trim();
  const problems: string[] = [];
  if (!user) problems.push('ADMIN_USERNAME');
  if (!hash || !hash.startsWith('scrypt:')) problems.push('ADMIN_PASSWORD_HASH');
  if (!secret || secret.length < 32) problems.push('SESSION_SECRET (at least 32 characters)');
  return { user, hash, secret, problems };
}

function scrypt(password: string, salt: Buffer, N: number, r: number, p: number, len: number) {
  return new Promise<Buffer>((res, rej) => scryptCb(password, salt, len, { N, r, p, maxmem: 256 * N * r }, (e, k) => (e ? rej(e) : res(k))));
}

/** Format: scrypt:N:r:p:<salt base64>:<hash base64> */
export async function hashPassword(password: string) {
  const N = 2 ** 15, r = 8, p = 1;
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, N, r, p, 64);
  return `scrypt:${N}:${r}:${p}:${salt.toString('base64')}:${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [tag, n, r, p, salt, hash] = stored.split(':');
  if (tag !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const key = await scrypt(password, Buffer.from(salt, 'base64'), Number(n), Number(r), Number(p), expected.length);
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export const safeEqual = (a: string, b: string) => {
  const x = createHmac('sha256', 'cmp').update(a).digest();
  const y = createHmac('sha256', 'cmp').update(b).digest();
  return timingSafeEqual(x, y);
};

const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const sign = (secret: string, data: string) => createHmac('sha256', secret).update(data).digest('base64url');

export function createSession(user: string, secret: string) {
  const s: Session = { user, sid: randomBytes(18).toString('base64url'), exp: Date.now() + SESSION_HOURS * 3600_000 };
  const body = b64u(JSON.stringify(s));
  return { session: s, token: `${body}.${sign(secret, body)}` };
}

export function readSession(req: IncomingMessage, secret: string): Session | null {
  const raw = parseCookies(req.headers.cookie)[COOKIE];
  if (!raw) return null;
  const [body, mac] = raw.split('.');
  if (!body || !mac || !safeEqual(mac, sign(secret, body))) return null;
  try {
    const s = JSON.parse(Buffer.from(body, 'base64url').toString()) as Session;
    if (typeof s.exp !== 'number' || s.exp < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export const csrfFor = (s: Session, secret: string) => sign(secret, `csrf:${s.sid}`);

export function sessionCookie(token: string, secure: boolean) {
  return `${COOKIE}=${token}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secure ? '; Secure' : ''}`;
}
export function clearCookie(secure: boolean) {
  return `${COOKIE}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}

function parseCookies(h?: string) {
  const out: Record<string, string> = {};
  for (const part of (h ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

/* Login throttling: per client address, 6 failed attempts per 15 minutes (per server instance). */
const failures = new Map<string, number[]>();
const WINDOW = 15 * 60_000;
export function tooManyAttempts(ip: string) {
  const now = Date.now();
  const list = (failures.get(ip) ?? []).filter((t) => now - t < WINDOW);
  failures.set(ip, list);
  return list.length >= 6;
}
export function recordFailure(ip: string) {
  const list = failures.get(ip) ?? [];
  list.push(Date.now());
  failures.set(ip, list);
  if (failures.size > 5000) failures.clear();
}
export const clearFailures = (ip: string) => failures.delete(ip);
