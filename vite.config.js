import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
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
