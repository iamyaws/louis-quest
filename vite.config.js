import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Stamp a unique build ID into sw.js at build time so the service worker's
// CACHE_NAME changes on every production build. Without this, the
// hand-written SW's cache name ("ronki-v4") only changes when a developer
// remembers to bump it — and twice this sprint that led to users stuck on
// a stale cache across a deploy.
//
// Note: Vite copies files from public/ into dist/ *after* generateBundle
// runs, bypassing the bundle object. So we rewrite on disk in closeBundle
// after the copy is complete, replacing the literal "__BUILD_ID__" token.
function stampServiceWorkerBuildId() {
  const buildId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  let resolvedOutDir = 'dist';
  return {
    name: 'stamp-sw-build-id',
    apply: 'build',
    configResolved(cfg) {
      resolvedOutDir = cfg.build?.outDir || 'dist';
    },
    async closeBundle() {
      const swPath = path.resolve(resolvedOutDir, 'sw.js');
      try {
        const original = await fs.readFile(swPath, 'utf8');
        const stamped = original.replace(/__BUILD_ID__/g, buildId);
        if (stamped !== original) {
          await fs.writeFile(swPath, stamped, 'utf8');
        }
      } catch (err) {
        // If sw.js isn't there, the build just doesn't ship one. Don't fail.
        if (err.code !== 'ENOENT') throw err;
      }
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), react(), stampServiceWorkerBuildId()],
  // Default to root for app.ronki.de deploy.
  // GitHub Actions workflow overrides this with --base /Ronki/ for gh-pages mirror.
  base: '/',
  server: {
    port: 5173,
    open: true,
    hmr: { path: '/', clientPort: 5173 },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy third-party libs into separate chunks so the main app
        // bundle stays under the 500 kB advisory threshold. Improves first-paint
        // caching on return visits since vendors change rarely.
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion': ['motion', 'motion/react'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    // Exclude marketing website tests from the default app test run.
    // They have drifted behavior and test the separate website/ bundle.
    // Run explicitly with `npx vitest run website` when working on that.
    exclude: ['**/node_modules/**', '**/dist/**', 'website/**'],
  },
});
