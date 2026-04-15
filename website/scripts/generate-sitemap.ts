import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/wie-es-funktioniert', priority: '0.9' },
  { path: '/wissenschaft', priority: '0.8' },
  { path: '/impressum', priority: '0.3' },
  { path: '/datenschutz', priority: '0.3' },
];

const today = new Date().toISOString().split('T')[0];
const origin = 'https://ronki.de';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (r) => `  <url>
    <loc>${origin}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${r.priority}</priority>
  </url>`,
).join('\n')}
</urlset>
`;

const out = resolve(__dirname, '../public/sitemap.xml');
writeFileSync(out, xml);
console.log(`Wrote ${out}`);
