import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// Each page keeps its own .html URL; all of them mount the same React app (see src/main.tsx).
const pages = ['index', 'about', 'tracks', 'speakers', 'guests', 'programme', 'call-for-papers', 'registration', 'committee', 'events', 'sponsors', 'venue'];

// Injects the loading screen into every public page so it paints before the bundle loads.
// It shows on every page load and leaves once the page is ready. The admin page has none.
function bootScreen(): Plugin {
  const file = resolve(import.meta.dirname, 'src/components/loading/boot-screen.html');
  return {
    name: 'iccmm-boot-screen',
    transformIndexHtml(_html, ctx) {
      if (/admin\.html$/.test(ctx.filename) || ctx.path === '/admin' || ctx.path.startsWith('/admin.html')) return;
      return [
        { tag: 'div', injectTo: 'body-prepend', attrs: { 'data-boot': '' }, children: readFileSync(file, 'utf8') },
      ];
    },
  };
}

// Development only: serves the CMS API (server/router.ts, the same code as the Vercel function in api/cms.ts)
// on the dev server, and /admin → admin.html.
function cmsDevApi(): Plugin {
  return {
    name: 'iccmm-cms-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        if (path === '/admin' || path === '/admin/') { req.url = '/admin.html'; return next(); }
        if (!path.startsWith('/api/')) return next();
        try {
          const mod = await server.ssrLoadModule('/server/router.ts');
          await mod.handle(req, res);
        } catch (e) {
          next(e);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Make .env / .env.local values (ADMIN_*, SESSION_SECRET, FIREBASE_*) available to the dev API
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    base: './',
    plugins: [react(), bootScreen(), cmsDevApi()],
    ssr: { external: ['sharp', 'firebase-admin'] },
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        input: {
          ...Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, `${p}.html`)])),
          admin: resolve(import.meta.dirname, 'admin.html'),
        },
      },
    },
  };
});
