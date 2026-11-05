import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// Each page keeps its own .html URL; all of them mount the same React app (see src/main.tsx).
const pages = ['index', 'about', 'tracks', 'speakers', 'guests', 'programme', 'call-for-papers', 'registration', 'committee', 'events', 'sponsors', 'venue'];

// Injects the loading screen into every page so it paints before the bundle loads.
// It shows on every page load and leaves once the page is ready.
function bootScreen(): Plugin {
  const file = resolve(import.meta.dirname, 'src/components/loading/boot-screen.html');
  return {
    name: 'iccmm-boot-screen',
    transformIndexHtml() {
      return [
        { tag: 'div', injectTo: 'body-prepend', attrs: { 'data-boot': '' }, children: readFileSync(file, 'utf8') },
      ];
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), bootScreen()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, `${p}.html`)])),
    },
  },
});
