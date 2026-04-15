# Ronki Website — Design Spec

**Date:** 2026-04-15
**Author:** Marc (product) + Claude (collaborator)
**Status:** Draft for review
**Companion spec:** [`2026-04-15-ronki-refocus-design.md`](./2026-04-15-ronki-refocus-design.md)

---

## 1. Context & Motivation

Ronki is moving from a private family build (Louis, 7yo) to a public launch. We need a marketing website that stands up to DACH parents evaluating kid apps, survives press scrutiny, and converts the right visitors — not the largest audience. The site is the **first contact point** where Ronki's positioning either lands or dies.

The risk: a generic "habit tracker for kids" pitch gets lost among Habitica-for-kids clones, gamified chore apps, and ad-saturated edutainment. Ronki's real job is something none of them own.

### What the website must carry

- **The mediator positioning** from the Refocus spec — Ronki is a narrative routine-mediator, not a habit tracker. The dragon is a neutral third voice that lubricates the parent-child routine friction Marc experienced firsthand.
- **The USP in one line:** *"counteracts lots of conversations and discussions… smoothens communication, builds confidence in taking care of himself."* This is what Ronki actually does in a real family. No competitor claims it because none can deliver it.
- **The explicit anti-feature list:** no streaks, no loot boxes, no ads, no dark patterns. In a market where parents are trained to expect these, the absence is the differentiator.
- **A research spine** that a skeptical parent (or journalist) can audit: AAP 2026, UNICEF RITEC-8, D4CR, Self-Determination Theory, Haidt. No fake testimonials, no fabricated stats.

### Who this is for

**Primary:** DACH parents (35–45) evaluating their child's screen time, already uncomfortable with dark-pattern engagement games, looking for something that reduces — not adds — conflict at home.

**Secondary:** Early allies — teachers, child psychologists, pediatricians, ethical-tech bloggers, klicksafe / SCHAU HIN adjacent audiences — who will share the site if it earns their trust.

**Not for:** parents hunting for "best free habit tracker," FOMO-driven engagement seekers, or feature-comparison shoppers. If they land, they'll bounce; that's fine.

---

## 2. North Star

> **Ronki trägt die Routine mit — damit die Menschen, die dich lieben, nicht schieben müssen.**
>
> (*Ronki carries the routine with you, so the people who love you don't have to push.*)

The website's job is to make a parent read that sentence and immediately know: *this is built for my actual Tuesday morning, not for a screenshot reel.*

### Messaging principles

1. **Show the mediator, not the feature.** Lead with the relational effect ("Ronki fragt, du musst nicht nerven"), not mechanics ("routines, rewards, XP").
2. **Anti-features are features.** Every "no streak / no ad / no loot" is a deliberate product decision, not an apology. State them proudly.
3. **Science as spine, not sprinkle.** Name the frameworks (AAP, RITEC-8, D4CR, SDT). Link the primary sources. No "studies show…" without a citation.
4. **Kinderentwicklung vor Engagement.** German parents in this segment are allergic to engagement-speak. Use developmental language.
5. **One real voice, not ten fake ones.** The Marc quote is the only testimonial at launch. No fabricated "Sarah, mom of 3." If we get more real ones later, add them; if not, stay silent.
6. **Show restraint.** The painterly aesthetic is quiet. The copy is quiet. The CTAs are quiet. Parents are loud-fatigued.

---

## 3. Scope

### In scope (this launch)

- **Core 3 pages (German primary):**
  - `/` — Homepage
  - `/wie-es-funktioniert` — How it works
  - `/wissenschaft` — The science behind it
- **Legal (DACH compliance):**
  - `/impressum`
  - `/datenschutz`
- **Waitlist capture** (pre-launch) via Supabase table, email-only (no name, no child data).
- **Coordinated drop flip** — a single config switch that turns the waitlist CTA into a "Kostenlos testen" (Try free) CTA on drop day, pointing to the PWA install flow.
- **Painterly visual direction** matching the app (shared design tokens, shared assets where possible).
- **`motion`-driven narrative scroll** on the homepage arc storyboard and `/wie-es-funktioniert` Arc Engine section.
- **Responsive + accessible** — mobile-first, WCAG 2.1 AA contrast, keyboard-navigable, `prefers-reduced-motion` respected.
- **Analytics-free at launch** — no PostHog, no GA4, no Plausible. Waitlist signup is the single conversion signal. (Defensible given the anti-dark-pattern story; revisit post-launch only if needed.)

### Out of scope (deferred or explicit no)

- English translation at launch (fast-follow after drop day).
- Blog / press / newsroom pages (add only when there's actual press to link).
- Multiple testimonials (see principle 5; one real voice until more exist).
- Video hero (painterly stills + motion scroll is enough; video adds weight without payoff at this stage).
- Newsletter beyond the waitlist single-trigger email (one email at drop day, then goodbye).
- App Store / Google Play links (Ronki is a PWA; install is via browser "Add to Home Screen" flow).
- Payment / subscription UI (free PWA at launch; monetization is a later decision, outside this spec).
- A/B testing infrastructure — we pick one hero variant (B) and ship it. Not enough traffic at launch for A/B signal.
- Comment systems, community features, forums.
- Third-party fonts beyond what the app already uses (no Google Fonts runtime fetch; self-host).

### Out of scope but worth noting

- **International privacy laws beyond GDPR.** DACH-first means GDPR-K is the compliance target. US COPPA / UK Age-Appropriate Design Code are considered later if we expand.
- **SEO beyond basics.** Meta tags, sitemap, robots.txt — yes. Content SEO strategy, keyword targeting, backlink work — no, not at this stage.

---

## 4. Positioning — the three pillars

These are the load-bearing claims. Every section of every page ladders up to one of them.

### Pillar 1 — Ronki fragt, nie nervt

*Ronki offers, never nags.*

- The dragon delivers routines as story beats, not reminders.
- No red badges, no "you broke it," no guilt.
- If the child skips a day, routines resume tomorrow, arcs pick up where they left off, the Sanctuary keeps accumulating.
- **The parent benefit:** you stop being the enforcer. The app is the neutral voice now.

### Pillar 2 — Das Sanctuary wächst mit

*The Sanctuary grows with you — continuity is spatial, not temporal.*

- No streaks. Nothing can "reißen" (break).
- Every completed routine leaves a visible trace in Ronki's world — a decor item, a micro-pet, a map on the wall.
- Progress is a **place** the child visits, not a counter they're afraid to lose.
- **The parent benefit:** continuity without the anxiety engine.

### Pillar 3 — Nach Kinderentwicklung gebaut, nicht nach Engagement-Tricks

*Built on child-development science, not engagement tricks.*

- Grounded in AAP 2026 screen-time guidelines, UNICEF RITEC-8 child-rights-in-digital framework, D4CR design principles, Self-Determination Theory.
- No variable-reward loops, no loot boxes, no FOMO timers, no ad monetization, ever.
- Arcs use days, not minutes. Anticipation replaces dopamine hits.
- **The parent benefit:** the app earns its time on the screen. You can defend it to yourself, your pediatrician, and your in-laws.

---

## 5. Page-by-page structure

### 5.1 Homepage `/`

**Goal:** Convert a skeptical DACH parent in under 60 seconds. Either they understand the mediator positioning and sign up for the waitlist, or they bounce — both are fine outcomes.

**Sections (top to bottom):**

1. **Hero**
   - H1: *"Ronki trägt die Routine mit."*
   - Sub: *"Ein Drachen-Gefährte, der Kinder durch den Alltag begleitet — damit du nicht zum tausendsten Mal 'Zähne putzen!' rufen musst."*
   - CTA primary: *Auf die Warteliste* (pre-launch) → *Kostenlos testen* (post-drop)
   - CTA secondary: *Wie Ronki arbeitet →* (scroll/link)
   - Visual: painterly dragon in Sanctuary, subtle motion parallax on scroll

2. **The real quote** (Marc, attributed honestly as "Marc, Vater von Louis, 7")
   - *"Ronki nimmt uns tausend Diskussionen ab. Mein Sohn kümmert sich mit dem Drachen um seine Routinen — und fühlt sich dabei selbstständig, nicht kontrolliert."*
   - Small headshot or painterly avatar, not a stock photo.

3. **Three pillars** (§4)
   - Card layout: painterly illustration + H3 + 2–3 sentence body per pillar.
   - No feature lists, no icons-in-circles, no "✓ Available."

4. **"Wie ein Tag mit Ronki aussieht"** — 3-beat arc storyboard
   - Horizontal scroll-linked motion (using `motion` library).
   - Beat 1 (morning, routine): Ronki bittet um's Zähneputzen, Kind tickt ab, Drache bedankt sich.
   - Beat 2 (afternoon, craft): Ronki schlägt vor, eine Karte vom Garten zu malen.
   - Beat 3 (evening, lore): Kind besucht's Sanctuary, Ronki erzählt eine Gute-Nacht-Geschichte.
   - Each beat: painterly scene + 1–2 line caption.

5. **"Was Ronki NICHT tut"** — anti-feature manifesto
   - Bulleted list with bold red-line-through-style but painterly:
     - *Keine Streaks, die reißen können.*
     - *Keine Werbung. Nie.*
     - *Keine Loot-Boxen, keine Glücksspiel-Mechaniken.*
     - *Keine Push-Nachrichten, die nerven.*
     - *Keine Daten-Weitergabe an Dritte.*
   - Each item links to the longer explanation on `/wie-es-funktioniert` or `/wissenschaft`.

6. **Waitlist/Launch CTA**
   - Repeat hero CTA with one-sentence framing: *"Bald verfügbar. Trag dich ein, wir melden uns einmal — am Start-Tag."*
   - Post-drop: *"Kostenlos in deinem Browser — keine App Store nötig."*
   - Email field + submit. Nothing else. (Supabase-backed, see §7.)

7. **Footer**
   - Links: Impressum, Datenschutz, Kontakt-Email, (later) Presse.
   - One-line disclosure: *"Ronki ist ein unabhängiges Projekt. Keine Werbe-Partner, keine Tracker."*

### 5.2 `/wie-es-funktioniert`

**Goal:** A parent who's curious after the homepage gets the full mechanic in 2–3 minutes of reading. Journalists and pediatricians can audit the design here.

**Sections:**

1. **The Arc Engine** — how a routine becomes a story
   - Explanation of beat types (routine, craft, lore) in plain language.
   - Visual: annotated screenshot of an arc beat as delivered in the app.
   - One paragraph on pacing: *"Etwa 1–2 Bögen pro Woche. Dazwischen ruht Ronki. Keine Hetze."*

2. **The Sanctuary** — a place, not a screen
   - Painterly snapshots showing Sanctuary accretion over weeks.
   - Explanation: *"Jeder fertige Bogen hinterlässt eine Spur — eine Karte an der Wand, ein kleines Wesen, ein Erinnerungsstück. Fortschritt wird zu einem Ort."*
   - Call out the Hatching Chamber and decor-as-memory.

3. **The Micropedia** — discovery, not completion
   - Show the silhouette grid (painterly), with the N/60 counter.
   - Explanation: *"Etwa 60 Wesen warten darauf, entdeckt zu werden — über Wochen, nicht über einen Nachmittag."*
   - Emphasize anticipation over dopamine.

4. **"Was Ronki NICHT tut"** — expanded version of the homepage list
   - Each anti-feature gets a paragraph explaining the design rationale.
   - Links to `/wissenschaft` for the research backing.

5. **FAQ**
   - *Ab welchem Alter?* (6–10 as a sweet spot, with reasoning)
   - *Wie lange dauert eine Sitzung?* (3–15 Minuten; arcs run over days)
   - *Was passiert bei Bildschirmzeit-Konflikten?* (Ronki hat eine eingebaute Bildschirmzeit-Logik)
   - *Funktioniert's offline?* (Ja, PWA)
   - *Was kostet Ronki?* (Aktuell kostenlos. Wenn sich das ändert, sagen wir's klar.)

### 5.3 `/wissenschaft`

**Goal:** A parent who's been burned by "science-backed" marketing can verify Ronki's claims here. Every research anchor links to a primary source.

**Sections:**

1. **Intro paragraph**
   - *"Ronki ist nicht 'gamifiziert'. Ronki ist nach dem gebaut, was Kinderentwicklung wirklich braucht — und gegen das, was digitale Produkte für Kinder seit Jahren falsch machen."*

2. **Self-Determination Theory (Deci & Ryan)**
   - Three needs: Autonomie / Kompetenz / Zugehörigkeit.
   - How each maps to Ronki:
     - *Autonomie:* Kind wählt Tempo und Bögen, Ronki bietet statt zu befehlen.
     - *Kompetenz:* Routinen sind im Sweet Spot — machbar, nicht trivial.
     - *Zugehörigkeit:* Drache + Familie = dreifüßige Beziehung, kein Solo-Spiel.

3. **AAP 2026 screen-time guidelines**
   - Link to primary source.
   - Quote the relevant passage.
   - How Ronki aligns: session length caps, parent-in-loop features, no ad exposure.

4. **UNICEF RITEC-8**
   - Eight child-rights-in-digital principles.
   - Which ones Ronki actively designs for (privacy, safety, autonomy, participation).

5. **D4CR — Designing for Children's Rights**
   - The principle set.
   - Where Ronki applies it (onboarding, feedback, reward structure).

6. **Jonathan Haidt — *The Anxious Generation***
   - Short summary of the critique.
   - Ronki's response: async pacing, no comparison, no social features, no infinite scroll.

7. **Our explicit commitments**
   - *"Wir bauen aktiv gegen Dark Patterns. Das heißt konkret:"*
   - Concrete list: no variable rewards, no streak guilt, no FOMO timers, no dark UX, no ad monetization ever.
   - One-line pledge: *"Wenn wir das brechen, dürft ihr uns daran erinnern — öffentlich."*

8. **References & further reading**
   - Linked bibliography. Every claim on this page links somewhere verifiable.

### 5.4 `/impressum` and `/datenschutz`

- Standard DACH legal content.
- Impressum: operator details per TMG §5 (name, address, contact, VAT ID if applicable).
- Datenschutz: GDPR-K compliant, covers Supabase waitlist storage, cookie-free design, email handling, data retention (delete on request, delete after drop-day mail for non-converters).
- No tracking cookies → no cookie banner needed. State this explicitly on the Datenschutz page.

---

## 6. Visual direction

### Aesthetic

**Painterly watercolor.** Same aesthetic as the app (confirmed in memory, supersedes earlier isometric direction). Cream/parchment base, soft earth tones, hand-drawn feel. No flat illustrations, no 3D renders, no stock photography.

### Key visual assets needed

- **Painterly dragon hero** — Ronki as the website's main character. Reuse or re-render app dragon art.
- **Sanctuary snapshots** — 2–3 painterly scenes showing accretion (empty → week 2 → week 6).
- **Arc storyboard panels** — 3 painterly vignettes for the "Wie ein Tag aussieht" section.
- **Micropedia grid mockup** — silhouette tiles with 2–3 revealed, painterly.
- **Anti-feature illustrations** — small painterly icons/scenes for each "no streak / no ad / etc." item.

### Typography

- Reuse the app's font stack. If the app uses a painterly display font + readable body font, same here.
- Body copy minimum 18px on desktop, 16px on mobile, generous line-height (1.6+).
- Headlines generous but not shouty — the voice is quiet confidence.

### Motion

- `motion@^12.38.0` (already added to package.json — need to confirm whether it's in the website subfolder or shared root).
- Scroll-linked animations on the 3-beat arc storyboard.
- Subtle parallax on the hero (dragon drifts, Sanctuary details fade in).
- Hover/tap transitions on cards (lift, gentle shadow).
- **Respect `prefers-reduced-motion`** — all motion has a static fallback.

### Color

- Cream / parchment base (same as app).
- Earth-tone accent palette: dusty green, warm ochre, deep plum.
- **No neon, no high-saturation gradients, no "vibrant" anything.** Parents are loud-fatigued.
- Contrast: WCAG 2.1 AA minimum for all text.

---

## 7. Technical architecture

### Repo structure

Website lives in the same repo as the app, in a subfolder:

```
~/louis-quest/
  ├── src/                    # app (existing)
  ├── public/                 # app (existing)
  ├── website/                # NEW — marketing site
  │   ├── src/
  │   ├── public/
  │   ├── index.html
  │   ├── vite.config.ts      # separate Vite config
  │   └── package.json        # or share root — see below
  ├── package.json            # root
  └── docs/
```

**Dependency strategy:** Share the root `package.json` for all npm packages (React, Vite, Tailwind, motion, Supabase client). Separate Vite configs keep the builds independent. This avoids dependency drift between app and website.

**Build output:** Website builds to `~/louis-quest/website/dist/`, deployed independently from the app.

**Shared assets:** Design tokens (Tailwind config extensions, painterly color palette, font stack) live in a shared module importable by both builds. Painterly illustrations either symlinked or copied from a shared `assets/` directory.

### Stack

- **React 18** (matches app)
- **Vite 5.4.19** (matches app)
- **Tailwind CSS v4.2.2** (matches app)
- **motion v12.38.0** (matches app — already in root `package.json`, shared by both builds)
- **Supabase JS client v2.103.0** (matches app, for waitlist inserts)
- **TypeScript** (matches app)

### Hosting

- Static site (fully pre-rendered at build time).
- Host on Vercel, Netlify, or Cloudflare Pages (final pick in implementation plan — cheapest with good DACH performance wins).
- Custom domain: `ronki.de` (assumed; confirm availability + registration during implementation).
- HTTPS mandatory. HSTS header set.
- `ronki.app` as secondary / international redirect (if claimable).

### Waitlist table (Supabase)

```sql
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  source text,              -- utm_source or referrer if available (optional)
  locale text not null default 'de',
  notified_at timestamptz   -- set when drop-day email sent
);

-- RLS: only service role can read; public insert with rate-limit via function
alter table public.waitlist enable row level security;

create policy "public insert" on public.waitlist
  for insert to anon with check (true);
-- no select policy for anon → reads blocked
```

Rate-limiting: client-side debounce + optional Supabase Edge Function to cap per-IP inserts. Not critical for launch volumes.

### Launch switch

A single feature flag in a shared config file:

```ts
export const LAUNCH_STATE: "waitlist" | "live" = "waitlist"; // flip to "live" on drop day
```

Flipping this:
- Swaps hero CTA text (*Auf die Warteliste* → *Kostenlos testen*).
- Swaps CTA action (waitlist insert → PWA install redirect or deep link).
- Swaps the footer micro-copy.
- Triggers a one-time email to all waitlist subscribers (handled by a manually-run script, not an automated job — launch day is a human-in-the-loop moment).

### Accessibility

- Keyboard navigation throughout.
- Focus states visible (not overridden by Tailwind resets).
- `alt` text on all painterly illustrations.
- `prefers-reduced-motion` respected.
- WCAG 2.1 AA contrast minimum.
- Semantic HTML (real `<nav>`, `<main>`, `<article>` — not div-soup).

### Performance

- Target: **Lighthouse ≥ 95** on mobile for all four core pages.
- Painterly illustrations: WebP + AVIF with JPEG fallback, lazy-loaded below the fold.
- No runtime font fetches — self-host the painterly + body fonts used by the app.
- No third-party scripts (no analytics, no tag manager, no chat widget).
- Preload the hero illustration + first-viewport fonts.

### SEO basics

- Per-page meta title + description (German).
- Open Graph tags + painterly OG image (1200×630).
- `sitemap.xml` generated at build time.
- `robots.txt` allowing all (no secret areas).
- Semantic headings (one H1 per page, nested logically).
- Schema.org `SoftwareApplication` markup on `/` with proper description.

---

## 8. Content — messaging anchors

### Hero variants (locked: Variant B — differentiation-first)

Chosen over the "child-science-first" variant because the DACH segment that converts is the one already suspicious of mainstream kid apps. Differentiation-first filters for them directly.

### Research anchors (replace testimonials at launch)

- **AAP 2026** screen-time guidelines → primary source linked from `/wissenschaft`.
- **UNICEF RITEC-8** child rights in digital → primary source linked.
- **D4CR** (Designing for Children's Rights) → principle set linked.
- **Deci & Ryan — Self-Determination Theory** → foundational papers linked.
- **Jonathan Haidt — *The Anxious Generation*** → book + excerpt links.

Each anchor appears with a quoted claim + a link out. No paraphrased "studies say" copy.

### Tone

- **German first.** Accessible, warm, slightly literary. Not corporate, not cutesy.
- Sentence length varies — some long and thoughtful, many short and direct.
- Avoid: *"revolutionär"*, *"magisch"*, *"bahnbrechend"*, *"einzigartig"*. All banned.
- Use: *"ruhig"*, *"mit"*, *"damit"*, *"statt"*, *"ohne"*. The Ronki voice is preposition-rich.

### English fast-follow (post-launch)

Translate same structure. English headline drafts (for later):
- *"Ronki carries the routine with you — so the people who love you don't have to push."*
- *"A dragon companion who quietly takes the 'brush your teeth' nag off your plate."*

Final English copy decided at translation time, not now.

---

## 9. Launch phases

### Phase A — Build (before launch)

- Scaffold `website/` subfolder, shared Tailwind tokens, shared asset pipeline.
- Build all four pages (homepage, wie-es-funktioniert, wissenschaft, legal).
- Painterly asset production (dragon hero, Sanctuary snapshots, arc storyboard, Micropedia mockup, anti-feature illustrations).
- Supabase waitlist table + insert flow + rate-limiting.
- Set `LAUNCH_STATE = "waitlist"`.
- Deploy to staging at subdomain (e.g. `staging.ronki.de` or Vercel preview URL).
- Internal review + Marc-review.
- Deploy to production on `ronki.de`.

### Phase B — Pre-launch waitlist (open-ended window)

- Share the URL through Marc's network, ethical-tech communities (klicksafe, SCHAU HIN-adjacent), child-development-interested parents.
- Monitor waitlist count; no public counter on the site.
- No email blasts; the waitlist subscription contract is *"one email, at launch."*
- Iterate copy based on feedback if any surfaces.

### Phase C — Coordinated drop (single day)

- Flip `LAUNCH_STATE = "live"`.
- Send the single drop-day email to all waitlist subscribers (manual script run, human-verified send list).
- Homepage CTAs now point to the PWA install flow.
- Optional: coordinated share with any allied voices willing to post same-day.

### Phase D — Post-launch (weeks after drop)

- English translation + `/en/` locale added.
- Monitor install / waitlist conversion ratio (the only metric that matters at this stage).
- If real parent testimonials surface, add them (with explicit consent, real names or clear attribution).
- Consider adding `/presse` page only if actual press coverage happens.

---

## 10. Compliance

### GDPR-K (child-data-aware GDPR)

- **No child data collected on the website.** The waitlist is parent-facing; only parent email is captured.
- **Transparent purpose:** the waitlist form states explicitly, *"Wir schicken dir eine einzige E-Mail — am Start-Tag. Keine weiteren Nachrichten. Keine Weitergabe an Dritte."*
- **Data retention:** waitlist emails deleted 30 days after drop-day email sent unless the user converts to an app account.
- **Right to erasure:** inline unsubscribe link in the drop-day email + a `/datenschutz` contact email for deletion requests.
- **No third-party data sharing.** Supabase is the sole processor. Data stays in EU region (confirm Supabase project region is EU during setup).

### Cookie policy

- No tracking cookies → no cookie banner required.
- Any functional cookies (e.g. waitlist rate-limit) are session-only and documented on `/datenschutz`.

### Impressum

- Operator name, address, contact email.
- VAT ID if applicable.
- EU consumer dispute resolution platform link per Art. 14 Abs. 1 ODR-VO.

---

## 11. Success criteria

This website succeeds if:

- **Pre-launch:** We collect a waitlist of parents who clearly understand the mediator positioning (self-selection signal: signups from ethical-tech-adjacent sources, near-zero bounce on `/wissenschaft`).
- **Drop day:** Waitlist-to-install conversion rate exceeds typical "cold SaaS email" rates (target 25%+; we'll know after drop day if this was realistic).
- **Qualitative:** Parents describe Ronki to each other using our language ("mediator," "no streaks," "carries the routine"), not generic "habit tracker" language.
- **Journalistic:** If a skeptical kid-app journalist audits the site, they can verify every research claim within three clicks.
- **Long-term:** The site stays small, honest, and doesn't require a content-churn strategy to stay relevant.

---

## 12. Open questions / deferred decisions

1. **Domain confirmation.** `ronki.de` availability + registration — check and claim during implementation kickoff.
2. **Hosting provider choice.** Vercel vs. Netlify vs. Cloudflare Pages — decided during implementation based on DACH performance benchmarks + pricing.
3. **Waitlist rate-limiting approach.** Client debounce only, or Supabase Edge Function? Probably client-only for launch volume; revisit if abuse surfaces.
4. **Painterly asset production process.** In-house with Midjourney + hand-polish, commissioned from an illustrator, or reuse of app assets? Leaning reuse + targeted commissions for the 3–5 new hero/storyboard scenes.
5. **Drop-day email sender.** Supabase Edge Function with Resend? Manual via Marc's mail client? Resend API via one-off script is the leading candidate — keep it simple.
6. **OG image design.** Painterly dragon + tagline composite — produced alongside other painterly assets.
7. **English launch timing.** Immediately after drop-day traffic settles (1–2 weeks), or deliberate delay to not split focus? Default: 2-week delay.
8. **Parent testimonial ethics.** Marc's quote is explicit. If Marc wants Louis's voice on the site (with full consent), how do we handle that without exploiting a child for marketing? Probably defer entirely — Louis's story stays Louis's.
9. **Analytics reintroduction.** Stay analytics-free forever, or add privacy-respecting (Plausible / self-hosted Umami) post-launch? Default: revisit 3 months in.

---

## 13. Appendix — Research stream summaries

*(For implementation reference. Not intended for site content.)*

### Stream 1 — Indie game & kid-app site benchmarks

- **What works:** restrained aesthetic, single hero message, real voices, generous whitespace, painterly illustrations beat flat/3D for this audience.
- **What doesn't:** feature-list heroes, stock-photo "happy families," engagement-speak, loud gradients.

### Stream 2 — PWA marketing & funnel strategy

- PWAs have a higher trust bar than native apps because the "install" is unfamiliar. Counter by explaining "Add to Home Screen" clearly at drop-day.
- No App Store reviews → substitute with research anchors, real parent quote, press coverage.
- Conversion funnel is short: land → read → waitlist (or install). Every step must hold attention; no extra friction.

### Stream 3 — Parent personas & pain points

- **Primary segment:** engaged, screen-time-aware parents, 35–45, DACH. Read *Zeit Eltern*, follow child-dev voices, skeptical of gamification.
- **Pain points:** nagging fatigue, guilt about screen time, lack of apps that respect both child autonomy and parental values.
- **Trust signals that matter:** named frameworks, real voices, explicit anti-feature lists, privacy-first framing.

### Stream 4 — Science of kids in a digital era

- AAP 2026 updates emphasize async, non-addictive design.
- UNICEF RITEC-8 provides the child-rights frame.
- D4CR offers design principles specifically for children's products.
- Haidt's *Anxious Generation* is the cultural pressure making this moment ripe.
- SDT (Deci & Ryan) is the deepest theoretical spine — autonomy, competence, relatedness map perfectly to Ronki's mediator design.

---

*End of spec.*
