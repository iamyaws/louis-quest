import { Plugin } from 'vite';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

interface RouteMeta {
  path: string;
  title: string;
  description: string;
  ogImage?: string;
}

const ROUTES: RouteMeta[] = [
  {
    path: '/wie-es-funktioniert',
    title: 'So funktioniert Ronki',
    description:
      'Drei Phasen: Begleiten, Loslassen, Erinnern. Wie Ronki Kindern hilft, eigene Routinen aufzubauen.',
    ogImage: '/og-wie-es-funktioniert.jpg',
  },
  {
    path: '/wissenschaft',
    title: 'Wissenschaftlicher Hintergrund: Ronki',
    description:
      'Welche Forschung hinter Ronki steckt: Selbstbestimmungstheorie, Fading Scaffolding und Montessori.',
    ogImage: '/og-wissenschaft.jpg',
  },
  {
    path: '/faq',
    title: 'Häufige Fragen zu Ronki',
    description:
      'Antworten auf die häufigsten Fragen von Eltern zu Ronki: Geräte, Alter, Datenschutz, Preis und was das Alpha-Programm bedeutet.',
  },
  {
    path: '/fuer-eltern',
    title: 'Für Eltern: Ronki',
    description:
      'Sechs ehrliche Antworten auf die Fragen, die Eltern sich zu Ronki stellen: Bildschirmzeit, Datenschutz, Motivation, Preis und Alpha.',
  },
  {
    path: '/impressum',
    title: 'Impressum: Ronki',
    description: 'Anbieterkennzeichnung nach § 5 DDG und § 18 MStV.',
  },
  {
    path: '/datenschutz',
    title: 'Datenschutz: Ronki',
    description:
      'Wie wir mit deinen Daten umgehen. DSGVO-konform, EU-Hosting, kein Tracking.',
  },
  {
    path: '/agb',
    title: 'AGB: Ronki',
    description: 'Allgemeine Geschäftsbedingungen für die Nutzung von Ronki.',
  },
];

const DOMAIN = 'https://www.ronki.de';
const DEFAULT_OG = '/og-ronki.jpg';

function replaceMeta(html: string, route: RouteMeta): string {
  const og = route.ogImage || DEFAULT_OG;
  const url = `${DOMAIN}${route.path}`;

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${route.description}$2`,
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${route.title}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${route.description}$2`,
    )
    .replace(
      /(<meta\s+property="og:image"\s+content=")[^"]*(")/,
      `$1${DOMAIN}${og}$2`,
    )
    .replace(
      /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
      `$1${url}$2`,
    )
    .replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
      `$1${url}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
      `$1${route.title}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${route.description}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,
      `$1${DOMAIN}${og}$2`,
    );
}

export function prerenderMeta(): Plugin {
  let distDir: string;

  return {
    name: 'prerender-meta',
    configResolved(config) {
      distDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      if (!distDir) return;

      let indexHtml: string;
      try {
        indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');
      } catch {
        console.warn('[prerender-meta] Could not read dist/index.html, skipping.');
        return;
      }

      let count = 0;
      for (const route of ROUTES) {
        const html = replaceMeta(indexHtml, route);
        const dir = join(distDir, route.path);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), html);
        count++;
      }

      console.log(`[prerender-meta] Generated ${count} static HTML files for social crawlers.`);
    },
  };
}
