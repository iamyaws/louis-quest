# Ronki — Project Instructions for Claude

## Repo structure

This is a monorepo with two products:

- **`/` root** — the Ronki app (game/companion for kids). React 18 + Vite. Port 5173 dev, 4173 preview. Scripts: `dev`, `build`, `preview`.
- **`/website/`** — the marketing site at ronki.de. React 18 + Vite + Tailwind v4. Port 5174 dev. Scripts: `dev:web`, `build:web`, `preview:web`.

Both share the root `package.json` and `node_modules`. The website has its own Vite config at `website/vite.config.ts`.

## Deployment

- **Hosting**: Vercel (two projects share this repo — `ronki` for the marketing site, `ronki-app` for the PWA at `app.ronki.de`)
- **Domain**: `ronki.de` (primary), `playronki.de` + `playronki.com` (308 redirect), `app.ronki.de` (the PWA)
- **DNS**: GoDaddy → Vercel
- **Build config**: `vercel.json` at repo root (SPA rewrites only, no `buildCommand` — each Vercel project sets its own)
- **Branch**: both projects auto-deploy from `main`

## Website stack

- React 18 + Vite + Tailwind v4 + TypeScript strict
- `motion` package (Framer Motion successor) — import from `motion/react`
- `react-router-dom` v6 (lazy-loaded routes, eager only for `/`)
- Self-hosted fonts: Plus Jakarta Sans (display), Be Vietnam Pro (body) at `/public/fonts/`
- Palette: teal-dark `#1A3C3F`, teal `#2D5A5E`, sage `#50a082`, mustard `#FCD34D`, cream `#FDF8F0`, ink
- Custom Vite plugin: `vite-plugin-prerender-meta.ts` generates 18 static HTML variants per route for social crawlers

## App legal pages (app.ronki.de)

Distinct from the marketing site's legal pages. Lives in `src/pages/`:

- `Impressum.jsx` — mirrors marketing Impressum (same Marc, Unterföhring); adds Bildnachweise & KI-Transparenz for in-app art assets.
- `Datenschutz.jsx` — app-specific, covers: Google OAuth (Google Ireland as Auftragsverarbeiter, USA mother-company SCC), Supabase EU-region + Vercel EU-edge, Art. 8 DSGVO children's data with parent-as-consent-holder, TTDSG § 25 Abs. 2 Nr. 2 for localStorage/SW as technically necessary. 72-hour SLA for child-data deletion requests.
- `Nutzungsbedingungen.jsx` — Alpha-status disclaimer, Kardinalspflichten-carveout in § 8 Haftung, 30-day email notice for ToS changes, München Gerichtsstand (except consumer forum).

Routing setup in `src/main.jsx`: BrowserRouter wraps everything; `/impressum`, `/datenschutz`, `/nutzungsbedingungen` sit OUTSIDE the AuthProvider so parents can read them pre-consent (required for DSGVO Art. 13 compliance). All other paths fall through to `App` via catch-all `*` route.

LoginScreen (`src/context/AuthContext.tsx`) renders a small footer with links to all three pages across all login/signup/magic-link states.

When you touch any of these pages, cross-check: does the marketing-site equivalent at `ronki.de/impressum` / `/datenschutz` / `/agb` need the same update? They share the Marc-Unterföhring anbieter block but diverge on scope (marketing ≠ app).

## Supabase schema

### `public.waitlist` (pre-launch signups + screener)

Columns: `id`, `email` (unique), `locale`, `created_at`, `child_age` (text, comma-joined when multi-select), `challenge` (text, comma-joined), `willing_to_test` (`'ja' | 'vielleicht' | 'später'`), `screener_completed_at`.

RLS: anon can only `insert` (with `with_check: true` for now — flagged as "always true" by advisors but acceptable for waitlist). RPCs for anon:

- `waitlist_count()` → returns total count
- `update_waitlist_screener(email, child_age, challenge, willing_to_test)` → fills in screener once per email

### `public.site_feedback` (anonymous feedback + topic requests)

Columns: `id`, `created_at`, `message` (4-4000 chars), `email` (optional, validated), `source` (e.g. `fuer-eltern`, `faq`, `ratgeber/morgen-troedeln`), `locale`.

RLS: anon can only `insert` with CHECK constraints (length + email regex). No anon SELECT. Read via SQL / service role.

Query to read new submissions:

```sql
SELECT created_at, source, left(message, 200) AS preview, email
FROM site_feedback
ORDER BY created_at DESC
LIMIT 20;
```

### `public.feedback` (authenticated in-app feedback)

Distinct from `site_feedback`. Ties to `auth.uid()` for logged-in Ronki app users. **Do not conflate with website feedback.**

### Env vars (Vercel)

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Launch state

`website/src/config/launch-state.ts` defines:

```ts
type LaunchState = 'waitlist' | 'beta' | 'live';
const LAUNCH_STATE: LaunchState = 'beta';  // current
```

Each state has a `LaunchCopy` object with `ctaLabel`, `ctaAction`, `ctaHelper`, `footerMicro`. `WaitlistCTA` renders differently per state (live → install button; waitlist/beta → email form). Copy switches propagate automatically.

Current (April 2026): **beta**. CTA = "Frühzugang anfordern". Still runs the waitlist flow end-to-end (email → screener → success card invites `willing_to_test='ja'` to `app.ronki.de`).

## Brand voice rules (DO NOT break)

- **No em-dashes or en-dashes anywhere.** Not in body copy, not in H2s, not in image `alt`, not in SOURCES titles. Only acceptable use: inside JSX code comments (never rendered). Use periods, colons, semicolons, commas.
- **No AI-slop vocab:** Landscape, Journey, Delve, Realm, Tapestry, navigate, impeccable, seamless, robust, paradigm, leverage, unlock, empower, holistic, synergy.
- **German first.** Du-Form. Calm, parent-to-parent, practical, not startup-y.
- **Founder mentality welcome.** Marc's Gamer-Vater / "schlechtes Engagement-Metric, gutes Erziehungs-Metric" P.S. is the signature closer (used in MorgenTroedeln, DarkPatternsKinderApps, welcome-email template).
- **No dark patterns.** No fake scarcity, no streak pressure, no manipulative copy.
- **No fake testimonials.** Removed. Impressum declares AI-art sources (Midjourney, Gemini/Imagen).
- **Target audience.** German parents of 5-9 year olds. Not tech-savvy, not early adopters.

## Ritual vs. Routine positioning (April 2026)

Hybrid approach: **"Routine" stays in SEO-visible layers** (page titles, slugs, H2s, opening paragraphs) because German parents google "Morgenroutine" not "Morgenritual". **"Ritual" is the brand-voice reframe** in Ronki's self-descriptions and CTAs.

Canonical sentence: *"Routinen optimiert man. Rituale lebt man. Ronki ist für den Unterschied gebaut."*

Voice split across brand-facing pages:

- **Option C (spiky-founder, Gamer-Vater voice)** on Home (`HeroVariantF`) + HowItWorks.
- **Option B (quiet, autonomy-centered)** on Wissenschaft + FuerEltern.
- Every Ratgeber article has a standard reframe paragraph in its "Was wir bei Ronki anders machen" section: *"Ein Wort zur Sprache: was hier Routine heißt, nennen wir bei Ronki tägliches Ritual. Routine führt man aus. Rituale lebt man gemeinsam."*

## Key conventions

- All pages use `PageMeta` with `canonicalPath` + optional `ogImage` (PageMeta auto-resolves root-relative paths to absolute URLs for crawlers)
- `WaitlistCTA launchState={LAUNCH_STATE}` is the single source of truth for signup forms
- `PainterlyShell` wraps all pages (watercolor background, scroll progress bar, skip-to-content link)
- `FeedbackForm source="..."` with honeypot wrapper is the single-source feedback component (FuerEltern, FAQ, RatgeberArticle shell)
- `RatgeberArticle` shell exports `StepCard`, `Steps`, `PullQuote`, `Callout` (4 variants), `Figure` primitives for any article body

## Content surfaces (as of 20 Apr 2026)

### Ratgeber hub (`/ratgeber`)

7 German long-form articles, each ~1400-2500 words with painterly hero images + custom SVG figures:

| Slug | Figure |
|------|--------|
| `morgen-troedeln` (voice benchmark) | TroedelLoop (stress feedback circle) |
| `sticker-chart-alternative` | StickerDecayCurve (reward-inflation bars) |
| `dark-patterns-kinder-apps` | DarkPatternMockup (annotated kids-app phone) |
| `morgenroutine-grundschulkind` | Timeline (6:45-7:35) |
| `abendroutine-grundschulkind` | Timeline (19:10-19:55) |
| `zaehneputzen-ohne-streit` | (none, 3 StepCards carry it) |
| `einschulung-selbststaendigkeit` | EinschulungComparison (erwartet vs. nicht) |

Figures live in `website/src/components/RatgeberFigures.tsx`. OG images in `website/public/og-ratgeber-*.jpg`.

### Other surfaces

- `/` Home (HeroVariantF, spiky-founder Ritual framing)
- `/wie-es-funktioniert` HowItWorks
- `/wissenschaft` Science (quiet Ritual framing, research-focused)
- `/fuer-eltern` FuerEltern (quiet Ritual framing + FeedbackForm at end)
- `/faq` FAQ_Page (FAQPage schema + FeedbackForm at end)
- `/vorlagen` printable routine sheets (+ 3 sub-pages)
- `/installieren` per-device PWA install guide
- `/en` English HomeEN (minimal English landing)
- `/impressum`, `/datenschutz`, `/agb`

## SEO + a11y invariants

- All routes have proper meta tags via PageMeta (injected client-side for React, prerendered statically for crawlers)
- `font-display: swap` on all @font-face
- Skip-to-content link in PainterlyShell
- Structured data: Organization, SoftwareApplication, FAQPage schemas on homepage
- sitemap.xml + robots.txt at `/public/` (robots blocks `/modern`, `/v2`, `/v3`, `/hero-compare`, `/alt/`)
- GSC sitemap submitted 20.04.2026. Initial crawl pending 24-48h.

## Legal compliance (DSGVO)

All audited. If you modify, stay compliant:

- **Impressum** (`/impressum`): Marc Förster, Föhringer Allee 33, 85774 Unterföhring. `Bildnachweise & KI-Transparenz` section names Midjourney + Gemini/Imagen explicitly, cites § 2 Abs. 2 UrhG, clarifies Marc's photo is real, provides takedown contact.
- **Datenschutz** (`/datenschutz`): Full DSGVO disclosure. Vercel + Supabase (US companies, EU regions, SCC-covered). ImprovMX (FR, EU). BayLDA as complaint authority.
- **AGB** (`/agb`): Kardinalspflichten carve-out in §6 Haftung. §7 requires active notification for AGB changes.
- **Waitlist form**: Datenschutz link visible before submission. Informed consent.
- **FeedbackForm**: Honeypot protected. If email digest pipeline is added (Resend etc.), update Datenschutz with the new sub-processor before shipping.

## Install page

`/installieren` covers iPhone/iPad (Safari required), Android Chrome (+ Samsung Internet + Firefox fallbacks), Amazon Fire Tablet (Chrome from Appstore or Silk fallback), Desktop. Plus "Die ersten 10 Minuten" briefing with parent + child columns. Content sourced from the Notion doc linked below; when you change install copy, update BOTH the Notion page AND `website/src/pages/Installieren.tsx` to keep them in sync.

## Outreach assets (Notion, not in the repo)

All outreach drafts live in Notion: **[Ronki · Onboarding & Outreach-Entwürfe](https://www.notion.so/34811efd973181c186d7fe359905785b)** (child page of the `Ronki` parent page).

Contents:

1. Install instructions per device (also the source-of-truth for `/installieren`)
2. "Die ersten 10 Minuten" briefing (parent + child columns, same content as the install page's footer section)
3. **Welcome email — two plaintext templates**: Vorlage 1 kurz/persönlich (~90 words), Vorlage 2 ausführlich/warm (~230 words). Each is code-fenced for clean Gmail paste. `[Vorname]` placeholder.
4. **WhatsApp shares — three variants**: persönliche Einzel-Nachricht with `[Name]` + `[Kind]` + `[ANKER]` placeholders (Marc's preference), ultra-kurz, Gruppenchat. Pretend-live framing (no "Frühzugang" label in the message).
5. Next-steps checklist.

Welcome-email template ends with the Gamer-Vater P.S. Unsubscribe footer is mandatory (GDPR). **Edit in Notion, never copy back into the repo** — the repo is code-only going forward.

## Active strategy (Apr 2026)

**We shipped the Ratgeber hub.** See `docs/onboarding-drafts.md` and Notion `Ronki Website & Launch To-Dos` database for current priorities.

**Distribution pipeline:** At time of writing, 4 waitlist signups (1 `willing_to_test='ja'` = Marc's test, 3 skipped screener). Next move: Marc sends WhatsApp Vorlage A to 5-10 personal contacts to fill the pipeline → they sign up → answer 'ja' in screener → get welcome Vorlage 2 → test → feedback.

**Email digest for `site_feedback`: deferred.** YAGNI until volume justifies Resend + Edge Function + Datenschutz update. Marc reads via Supabase SQL for now.

**`child_age` / `challenge` → `text[]` migration: deferred.** Comma-joined strings work. Migrate when analytics require per-bucket filtering.

## What to do when user asks for changes

1. Follow the brand voice rules above. Pay special attention to em-dash and AI-slop sweeps after any writing task. Run `Grep pattern='—'` across touched files before declaring done.
2. Run `npm run build:web` from repo root to verify before push.
3. Commit with conventional messages (`feat(ratgeber):`, `fix(feedback):`, `docs:`, etc.).
4. Push to `main` — Vercel auto-deploys both projects.
5. Update the Notion outreach page (linked above) if the change affects install flow or outreach copy. Do NOT create new `/docs` markdown files in the repo — outreach/brand docs live in Notion, not in git.
6. Update the Notion task DB if it's a trackable item.
7. For Supabase DDL changes: use `mcp__supabase__apply_migration`, check `get_advisors` for new warnings, update CLAUDE.md schema section.
