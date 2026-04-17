import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { prerenderMeta } from './vite-plugin-prerender-meta';

export default defineConfig({
  root: path.resolve(__dirname),
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
