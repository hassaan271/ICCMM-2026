// HTTP API for the CMS. Runs as one Vercel function (api/cms.ts) and, in development, as Vite middleware.
//   Public:  GET /api/content            all site content (cached at the edge for a few seconds)
//            GET /api/media/<file>       uploaded images and PDFs
//   Admin:   /api/admin/*                session cookie + CSRF header required (except login)
import type { IncomingMessage, ServerResponse } from 'node:http';
import { seed } from '../src/content/seed.js';
import { sectionByKey, validateSection, ValidationError } from '../src/content/schema.js';
import type { SectionKey } from '../src/content/types.js';
import { authConfig, verifyPassword, safeEqual, createSession, readSession, csrfFor, sessionCookie, clearCookie, tooManyAttempts, recordFailure, clearFailures, type Session } from './auth.js';
import { getStore, Conflict, NotConfigured, KEY_RE, type Store } from './store.js';
import { processUpload, findUsage, UploadError, KINDS, MAX_UPLOAD, type Kind } from './media.js';

type Req = IncomingMessage & { body?: unknown };

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const SECTION_KEYS = Object.keys(seed) as SectionKey[];

function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(json);
}

async function readBody(req: Req, limit: number): Promise<Buffer> {
  // On Vercel the body may already be buffered and exposed as req.body
  const pre = req.body;
  if (pre !== undefined && pre !== null) {
    if (Buffer.isBuffer(pre)) return pre;
    if (typeof pre === 'string') return Buffer.from(pre);
    return Buffer.from(JSON.stringify(pre));
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const c of req) {
    size += (c as Buffer).length;
    if (size > limit) throw new HttpError(413, 'The upload is too large (max 4 MB).');
    chunks.push(c as Buffer);
  }
  return Buffer.concat(chunks);
}

async function readJson(req: Req): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body as Record<string, unknown>;
  const raw = await readBody(req, 3 * 1024 * 1024);
  try {
    const v = JSON.parse(raw.toString('utf8') || '{}');
    if (!v || typeof v !== 'object') throw new Error();
    return v;
  } catch {
    throw new HttpError(400, 'Invalid request body.');
  }
}

const isSecure = (req: IncomingMessage) => req.headers['x-forwarded-proto'] === 'https' || !!process.env.VERCEL;
const clientIp = (req: IncomingMessage) => String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';

/** Rejects cross-site requests: the Origin (or Referer) must match the Host. */
function sameOrigin(req: IncomingMessage) {
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  const origin = req.headers.origin ?? req.headers.referer;
  if (!origin) return req.headers['sec-fetch-site'] === undefined || req.headers['sec-fetch-site'] === 'same-origin';
  try { return new URL(String(origin)).host === host; } catch { return false; }
}

/** Live content merged over the seed, so a section never stored yet shows its original content. */
async function contentWithVersions(store: Store) {
  const stored = await store.getAll();
  const content: Record<string, unknown> = {};
  const versions: Record<string, { version: number; updatedAt: string | null; updatedBy: string | null }> = {};
  for (const k of SECTION_KEYS) {
    const e = stored[k];
    content[k] = e ? e.value : seed[k];
    versions[k] = e ? { version: e.version, updatedAt: e.updatedAt, updatedBy: e.updatedBy } : { version: 0, updatedAt: null, updatedBy: null };
  }
  return { content, versions };
}

let publicCache: { at: number; body: string } | null = null;

export async function handle(req: Req, res: ServerResponse) {
  try {
    const url = new URL(req.url ?? '/', 'http://local');
    const route = (url.searchParams.get('__route') ?? url.pathname.replace(/^\/api\/?/, '')).replace(/^\/+|\/+$/g, '');
    const parts = route.split('/').filter(Boolean);
    const method = req.method ?? 'GET';

    /* ── Public ── */
    if (parts[0] === 'content' && parts.length === 1) {
      if (method !== 'GET' && method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');
      if (!publicCache || Date.now() - publicCache.at > 5000 || url.searchParams.has('fresh')) {
        const { content } = await contentWithVersions(await getStore());
        publicCache = { at: Date.now(), body: JSON.stringify(content) };
      }
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
      });
      return res.end(method === 'HEAD' ? undefined : publicCache.body);
    }
    if (parts[0] === 'media' && parts.length === 2) {
      if (method !== 'GET' && method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');
      const key = parts[1];
      if (!KEY_RE.test(key)) throw new HttpError(404, 'Not found.');
      const file = await (await getStore()).getFile(key);
      if (!file) throw new HttpError(404, 'Not found.');
      res.writeHead(200, {
        'Content-Type': file.type,
        'Content-Length': String(file.data.length),
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        ...(file.type === 'application/pdf' ? { 'Content-Disposition': `inline; filename="${key}"` } : {}),
      });
      return res.end(method === 'HEAD' ? undefined : file.data);
    }

    if (parts[0] !== 'admin') throw new HttpError(404, 'Not found.');

    /* ── Admin ── */
    const cfg = authConfig();
    if (cfg.problems.length) throw new HttpError(503, `The admin login is not set up yet. Missing environment variables: ${cfg.problems.join(', ')}. See README → Admin panel.`);
    const secret = cfg.secret!;
    const secure = isSecure(req);
    const action = parts.slice(1).join('/');

    if (action === 'login') {
      if (method !== 'POST') throw new HttpError(405, 'Method not allowed.');
      if (!sameOrigin(req)) throw new HttpError(403, 'Cross-site request blocked.');
      const ip = clientIp(req);
      if (tooManyAttempts(ip)) throw new HttpError(429, 'Too many failed attempts. Wait 15 minutes and try again.');
      const body = await readJson(req);
      const username = String(body.username ?? '').trim().slice(0, 200);
      const password = String(body.password ?? '').slice(0, 500);
      const okUser = safeEqual(username.toLowerCase(), cfg.user!.toLowerCase());
      const okPass = await verifyPassword(password, cfg.hash!);
      if (!okUser || !okPass) {
        recordFailure(ip);
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
        throw new HttpError(401, 'Incorrect username or password.');
      }
      clearFailures(ip);
      const { session, token } = createSession(cfg.user!, secret);
      return send(res, 200, { user: session.user, csrf: csrfFor(session, secret), expires: session.exp }, { 'Set-Cookie': sessionCookie(token, secure) });
    }

    const session = readSession(req, secret);
    if (action === 'session' && method === 'GET') {
      if (!session) throw new HttpError(401, 'Not signed in.');
      const store = await getStore();
      return send(res, 200, { user: session.user, csrf: csrfFor(session, secret), expires: session.exp, storage: store.name });
    }
    if (!session) throw new HttpError(401, 'Your session has ended. Please sign in again.');
    if (method !== 'GET') {
      const token = String(req.headers['x-csrf-token'] ?? '');
      if (!sameOrigin(req) || !token || !safeEqual(token, csrfFor(session, secret))) throw new HttpError(403, 'Security check failed. Reload the page and try again.');
    }
    if (action === 'logout') {
      if (method !== 'POST') throw new HttpError(405, 'Method not allowed.');
      return send(res, 200, { ok: true }, { 'Set-Cookie': clearCookie(secure) });
    }
    return await adminRoute(req, res, method, parts.slice(1), session);
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, { error: e.message });
    if (e instanceof ValidationError) return send(res, 422, { error: e.message, path: e.path });
    if (e instanceof UploadError) return send(res, 422, { error: e.message });
    if (e instanceof Conflict) return send(res, 409, { error: 'This section was changed elsewhere since you opened it. Reload to get the latest version, then make your change again.' });
    if (e instanceof NotConfigured) return send(res, 503, { error: e.message });
    console.error('[cms]', e);
    return send(res, 500, { error: 'Something went wrong on the server. Please try again.' });
  }
}

async function adminRoute(req: Req, res: ServerResponse, method: string, p: string[], session: Session) {
  const store = await getStore();

  // GET /api/admin/content
  if (p[0] === 'content' && p.length === 1 && method === 'GET') {
    return send(res, 200, await contentWithVersions(store));
  }
  // PUT /api/admin/content/<section>   { value, version }
  // POST /api/admin/content/<section>/reset   { version }
  if (p[0] === 'content' && p[1] && (p.length === 2 || (p.length === 3 && p[2] === 'reset'))) {
    const key = p[1] as SectionKey;
    if (!sectionByKey[key]) throw new HttpError(404, 'Unknown section.');
    const reset = p.length === 3;
    if (reset ? method !== 'POST' : method !== 'PUT') throw new HttpError(405, 'Method not allowed.');
    const body = await readJson(req);
    const base = typeof body.version === 'number' ? body.version : null;
    const value = validateSection(key, reset ? seed[key] : body.value);
    const e = await store.put(key, value, base, session.user);
    publicCache = null;
    return send(res, 200, { value: e.value, version: e.version, updatedAt: e.updatedAt, updatedBy: e.updatedBy });
  }
  // GET /api/admin/export
  if (p[0] === 'export' && p.length === 1 && method === 'GET') {
    const { content } = await contentWithVersions(store);
    return send(res, 200, content, { 'Content-Disposition': `attachment; filename="iccmm-content-${new Date().toISOString().slice(0, 10)}.json"` });
  }
  // Media library
  if (p[0] === 'media' && p.length === 1 && method === 'GET') {
    const [{ content }, assets] = await Promise.all([contentWithVersions(store), store.listAssets()]);
    return send(res, 200, { assets: assets.map((a) => ({ ...a, usedIn: findUsage(content, a.id) })) });
  }
  if (p[0] === 'media' && p.length === 1 && method === 'POST') {
    const url = new URL(req.url ?? '/', 'http://local');
    const kind = (url.searchParams.get('kind') ?? '') as Kind;
    if (!KINDS.includes(kind)) throw new HttpError(400, 'Unknown upload type.');
    const name = (url.searchParams.get('name') ?? 'upload').slice(0, 200);
    const data = await readBody(req, MAX_UPLOAD + 1024);
    const { asset, files } = await processUpload(kind, data, name, session.user);
    await store.saveAsset(asset, files);
    return send(res, 201, { asset: { ...asset, usedIn: [] } });
  }
  if (p[0] === 'media' && p.length === 2 && method === 'DELETE') {
    const assets = await store.listAssets();
    const asset = assets.find((a) => a.id === p[1]);
    if (!asset) throw new HttpError(404, 'File not found.');
    const { content } = await contentWithVersions(store);
    const used = findUsage(content, asset.id);
    if (used.length) throw new HttpError(409, `This file is still used in: ${used.map((k) => sectionByKey[k as SectionKey]?.label ?? k).join(', ')}. Remove it there first.`);
    await store.deleteAsset(asset);
    return send(res, 200, { ok: true });
  }
  throw new HttpError(404, 'Not found.');
}
