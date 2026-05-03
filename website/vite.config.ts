import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { prerenderMeta } from './vite-plugin-prerender-meta';

export default defineConfig({
  root: path.resolve(__dirname),
  // Read .env files from the repo root, not website/, so both the app
  // and the website share one source of truth for VITE_SUPABASE_URL +
  // VITE_SUPABASE_ANON_KEY. Avoids two parallel .env.local files
  // drifting out of sync.
  envDir: path.resolve(__dirname, '..'),
  base: '/',
  plugins: [tailwindcss(), react(), prerenderMeta()],
  server: {
    port: 5174,
    open: true,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: path.resolve(__dirname, 'src/test/setup.ts'),
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
