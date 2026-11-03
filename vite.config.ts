import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Each page keeps its own .html URL; all of them mount the same React app (see src/main.tsx).
const pages = ['index', 'call-for-papers', 'registration', 'committee', 'events', 'sponsors', 'venue'];

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, `${p}.html`)])),
    },
  },
});
