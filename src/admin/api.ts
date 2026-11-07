// Admin API client. The session lives in an HttpOnly cookie; the CSRF token is kept in memory only.
import type { SiteContent, SectionKey } from '../content/types';

export type Versions = Record<string, { version: number; updatedAt: string | null; updatedBy: string | null }>;
export type Asset = {
  id: string; kind: string; url: string; w?: number; h?: number; extra?: Record<string, unknown>;
  originalName: string; files: { key: string; type: string; size: number }[]; createdAt: string; createdBy: string; usedIn: string[];
};
export type SessionInfo = { user: string; csrf: string; expires: number; storage?: string };

export class ApiError extends Error {
  constructor(public status: number, message: string, public path?: string) { super(message); }
}

let csrf = '';
export const setCsrf = (t: string) => { csrf = t; };

async function call<T>(method: string, path: string, body?: unknown, raw?: { data: Blob; type: string }): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (method !== 'GET') headers['x-csrf-token'] = csrf;
  let payload: BodyInit | undefined;
  if (raw) { headers['content-type'] = 'application/octet-stream'; payload = raw.data; }
  else if (body !== undefined) { headers['content-type'] = 'application/json'; payload = JSON.stringify(body); }
  let r: Response;
  try {
    r = await fetch(`/api/admin/${path}`, { method, headers, body: payload, credentials: 'same-origin' });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your internet connection.');
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && path !== 'login' && path !== 'session') window.dispatchEvent(new Event('admin:signed-out'));
    throw new ApiError(r.status, data.error ?? `Request failed (${r.status})`, data.path);
  }
  return data as T;
}

export const api = {
  session: () => call<SessionInfo>('GET', 'session'),
  login: (username: string, password: string) => call<SessionInfo>('POST', 'login', { username, password }),
  logout: () => call<{ ok: true }>('POST', 'logout', {}),
  content: () => call<{ content: SiteContent; versions: Versions }>('GET', 'content'),
  save: <K extends SectionKey>(key: K, value: SiteContent[K], version: number) =>
    call<{ value: SiteContent[K]; version: number; updatedAt: string; updatedBy: string }>('PUT', `content/${key}`, { value, version }),
  reset: <K extends SectionKey>(key: K, version: number) =>
    call<{ value: SiteContent[K]; version: number; updatedAt: string; updatedBy: string }>('POST', `content/${key}/reset`, { version }),
  media: () => call<{ assets: Asset[] }>('GET', 'media'),
  upload: (kind: string, file: Blob, name: string) => call<{ asset: Asset }>('POST', `media?kind=${encodeURIComponent(kind)}&name=${encodeURIComponent(name)}`, undefined, { data: file, type: file.type }),
  deleteMedia: (id: string) => call<{ ok: true }>('DELETE', `media/${encodeURIComponent(id)}`),
  exportUrl: '/api/admin/export',
};

/** URL to show an image stored in content (site assets are relative to the site root). */
export function displayUrl(src: string | undefined | null, variant?: string) {
  if (!src) return '';
  let u = src;
  if (variant === 'pair') u = `${src}-640.webp`;
  else if (variant === 'poster') u = `${src}-560.webp`;
  return /^(https?:)?\/\//.test(u) || u.startsWith('/') ? u : `/${u}`;
}

export const MAX_UPLOAD = 4 * 1024 * 1024;

/** Shrinks very large photos in the browser so they fit the 4 MB upload limit. */
export async function prepareImage(file: File): Promise<Blob> {
  if (file.size <= MAX_UPLOAD) return file;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const scale = Math.min(1, 3000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  for (const q of [0.9, 0.8, 0.7]) {
    const b = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/jpeg', q));
    if (b && b.size <= MAX_UPLOAD) return b;
  }
  return file;
}

export const fmtBytes = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);
export const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
