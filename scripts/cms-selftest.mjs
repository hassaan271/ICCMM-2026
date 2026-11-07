// Checks that every seed section passes CMS validation unchanged (so nothing is lost on first save).
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { seed } = await server.ssrLoadModule('/src/content/seed.ts');
const { validateSection } = await server.ssrLoadModule('/src/content/schema.ts');
await server.close();
const sortKeys = (v) => Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]).filter(([, x]) => x !== undefined && x !== '' && x !== false && !(Array.isArray(x) && x.length === 0))) : v;
const norm = (v) => JSON.stringify(sortKeys(v));
let bad = 0;
for (const k of Object.keys(seed)) {
  try {
    const out = validateSection(k, seed[k]);
    if (norm(out) !== norm(seed[k])) {
      bad++;
      const a = norm(seed[k]), b = norm(out);
      let i = 0; while (a[i] === b[i]) i++;
      console.log('DIFF', k, '\n  seed:', a.slice(Math.max(0, i - 80), i + 80), '\n  out: ', b.slice(Math.max(0, i - 80), i + 80));
    }
  } catch (e) { bad++; console.log('FAIL', k, e.message); }
}
console.log(bad ? `${bad} problem(s)` : `all ${Object.keys(seed).length} sections round-trip cleanly`);
process.exit(bad ? 1 : 0);
