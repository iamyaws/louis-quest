# Ronki — Project Instructions for Claude

## Repo structure

This is a monorepo with two products:

- **`/` root** — the Ronki app (game/companion for kids). React 18 + Vite. Port 5173 dev, 4173 preview. Scripts: `dev`, `build`, `preview`.
- **`/website/`** — the marketing site at ronki.de. React 18 + Vite + Tailwind v4. Port 5174 dev. Scripts: `dev:web`, `build:web`, `preview:web`.

Both share the root `package.json` and `node_modules`. The website has its own Vite config at `website/vite.config.ts`.

## Deployment

- **Hosting**: Vercel
- **Domain**: `ronki.de` (primary), `playronki.de` + `playronki.com` (308 redirect)
- **DNS**: GoDaddy → Vercel (A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`)
- **Build config**: `vercel.json` at repo root (`buildCommand: npm run build:web`, `outputDirectory: website/dist`, SPA rewrites)
- **Branch**: Auto-deploys from `main`

## Website stack

- React 18 + Vite + Tailwind v4 + TypeScript strict
- `motion` package (Framer Motion successor) — import from `motion/react`
- `react-router-dom` v6 (lazy-loaded routes, eager only for `/`)
- Self-hosted fonts: Plus Jakarta Sans (display), Be Vietnam Pro (body) at `/public/fonts/`
- Palette: teal-dark `#1A3C3F`, teal `#2D5A5E`, sage `#50a082`, mustard `#FCD34D`, cream `#FDF8F0`, ink
- Custom Vite plugin: `vite-plugin-prerender-meta.ts` generates static HTML per route for social crawlers

## Supabase schema (waitlist)

Table `public.waitlist`:
- `id`, `email` (unique), `locale`, `created_at`
- `child_age`, `challenge`, `willing_to_test`, `screener_completed_at`

RLS: anon can only `insert`. RPCs for anon:
- `waitlist_count()` → returns total count
- `update_waitlist_screener(email, child_age, challenge, willing_to_test)` → fills in screener (once per email)

Env vars (in Vercel): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Brand voice rules (DO NOT break)

- **No em-dashes anywhere.** Use periods, colons, semicolons, commas.
- **German first.** Tone: calm, parent-respecting, practical, not startup-y.
- **No dark patterns.** No fake scarcity, no streak pressure, no manipulative copy.
- **Honesty over polish.** AI art is credited. Fake testimonials are forbidden (removed from site).
- **Target audience.** German parents of 5-9 year olds. Not tech-savvy, not early adopters.

## Key conventions

- All German pages use `PageMeta` component with `canonicalPath` → injects meta tags at runtime + canonical
- `WaitlistCTA` is the single source of truth for signup forms (used in hero + footer)
- `PainterlyShell` wraps all pages (provides watercolor background, scroll progress bar, skip-to-content link)
- Hero currently: `HeroVariantF` (Dashboard Peek, B+E copy). Alt variants exist for comparison at `/hero-compare`

## SEO + a11y invariants

- All routes have proper meta tags via PageMeta (injected client-side for React, prerendered statically for crawlers)
- `font-display: swap` on all @font-face
- Skip-to-content link in PainterlyShell
- Structured data: Organization, SoftwareApplication, FAQPage schemas on homepage
- sitemap.xml + robots.txt at `/public/` (note: robots blocks `/modern`, `/v2`, `/v3`, `/hero-compare`, `/alt/`)

## Legal compliance (DSGVO)

All audited and fixed. If you modify any of these, stay compliant:

- **Impressum** (`/impressum`): Marc Förster, Föhringer Allee 33, 85774 Unterföhring, phone, email, Kleinunternehmer note. Bildnachweise discloses Midjourney.
- **Datenschutz** (`/datenschutz`): Full DSGVO disclosure. Vercel + Supabase (US companies, EU regions, SCC-covered). ImprovMX (FR, EU). BayLDA as complaint authority.
- **AGB** (`/agb`): Kardinalspflichten carve-out in §6 Haftung. §7 requires active notification for AGB changes.
- **Waitlist form**: Datenschutz link visible before submission. Informed consent.

## Active strategy (Apr 2026)

**We are NOT doing a full content marketing SEO play.** See `Ronki Website & Launch To-Dos` database in Notion for current priorities.

**Tiered rollout plan:**
- Tier 1 (now): /fuer-eltern page, /faq page, real testimonials, Über mich
- Tier 2 (when app is beta-ready): flip CTA to "Frühzugang", pick 1-2 pillar articles based on screener data
- Tier 3 (month 3+): content hub / Ratgeber — only if Tier 1-2 show traction

**Why not more content now:** German parent SEO is a 12-18 month compounding play with established competitors. Marc's bottleneck is product readiness, not waitlist conversion.

## What to do when user asks for changes

1. Follow the brand voice rules above
2. Run `npx vite build --config website/vite.config.ts` to verify before push
3. Commit with descriptive conventional commit messages
4. Push to `main` — Vercel auto-deploys
5. Update the Notion task DB if it's a trackable item
