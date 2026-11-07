import { seed } from './seed';
import type { SiteContent } from './types';

// Content the public site renders. main.tsx loads the live content from the CMS (/api/content) and calls
// setContent() before the page modules are imported, so src/data/* read the live values. Any section that is
// missing or malformed in the live content falls back to the bundled seed.
let current: SiteContent = seed;

export function setContent(remote: unknown) {
  if (!remote || typeof remote !== 'object') return;
  const next = { ...seed } as Record<string, unknown>;
  for (const key of Object.keys(seed) as (keyof SiteContent)[]) {
    const v = (remote as Record<string, unknown>)[key];
    if (v === undefined) continue;
    const base = seed[key];
    const ok = Array.isArray(base) ? Array.isArray(v) : base === null ? true : typeof v === typeof base;
    if (ok) next[key] = v;
  }
  current = next as SiteContent;
}

export const site = () => current;

/** Fetches the live content, giving up after `ms` so a slow or missing service never blocks the page. */
export async function loadLiveContent(ms = 2500) {
  if (typeof fetch === 'undefined') return;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const fresh = new URLSearchParams(location.search).has('fresh');
    const r = await fetch(`/api/content${fresh ? '?fresh=' + Date.now() : ''}`, { signal: ctl.signal, headers: { accept: 'application/json' } });
    if (r.ok && (r.headers.get('content-type') ?? '').includes('json')) setContent(await r.json());
  } catch {
    /* offline, static preview or service down: keep the bundled content */
  } finally {
    clearTimeout(t);
  }
}
