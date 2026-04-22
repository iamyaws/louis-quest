import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Mirror of the main config's sw.js stamping plugin — see vite.config.js
// for the rationale. Kept duplicated here so this dev config stays
// self-contained (the two configs have no shared helper file today).
function stampServiceWorkerBuildId() {
  const buildId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  let resolvedOutDir = 'dist-dev';
  return {
    name: 'stamp-sw-build-id',
    apply: 'build',
    configResolved(cfg) {
      resolvedOutDir = cfg.build?.outDir || 'dist-dev';
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
        if (err.code !== 'ENOENT') throw err;
      }
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), react(), stampServiceWorkerBuildId()],
  base: '/Ronki/dev/',
  server: { port: 5174 },
});
