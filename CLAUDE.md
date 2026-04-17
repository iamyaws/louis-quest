# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout — Two Apps in One Repo

This repo contains **two separate Vite/React apps** that share the root `package.json`:

| App | Source | Vite config | Dev port | Build output |
|-----|--------|-------------|----------|--------------|
| **Ronki PWA** (the game) | `src/`, `index.html`, `public/` | `vite.config.js` (base `/Ronki/`) | 5173 | `dist/` → GitHub Pages `/Ronki/` |
| **Marketing website** | `website/src/`, `website/index.html`, `website/public/` | `website/vite.config.ts` (base `/`) | 5174 | `website/dist/` → Vercel |
| **Dev preview build** | same as PWA | `vite.config.dev.js` (base `/Ronki/dev/`) | 5174 | `dist-dev/` → GitHub Pages `/Ronki/dev/` |

When you change PWA code, never touch `website/`, and vice versa — they're deployed by different pipelines (`.github/workflows/deploy.yml` for the PWA, `vercel.json` → `npm run build:web` for the site).

## Commands

```bash
# PWA (the game)
npm run dev              # vite dev server, port 5173
npm run build            # production build → dist/
npm test                 # vitest run (single pass)
npm run test:watch       # vitest watch mode
npx vitest run path/to/file.test.ts                    # single test file
npx vitest run -t "matches a substring of test name"   # single test by name

# Marketing website
npm run dev:web          # vite --config website/vite.config.ts (port 5174)
npm run build:web        # production build → website/dist/
npm run test:web         # vitest run --config website/vite.config.ts

# Dev-channel deploy of the PWA (rare, manual)
bash scripts/deploy-dev.sh   # build with /Ronki/dev/ base + push to gh-pages /dev/
```

There is no separate lint or typecheck script — TypeScript is set to `noEmit` and runs implicitly via Vite. `tsconfig.json` has `allowJs: true`, so `.jsx`/`.js` files coexist with `.ts`/`.tsx`.

## Architecture: The Two Generations of State

There are **two parallel state systems** in `src/`. Read this carefully before editing any state code.

### Active system — `TaskContext` (`src/context/TaskContext.tsx`)
This is what `App.jsx` uses. `TaskProvider` owns the entire game state (`TaskState`), all actions, all derived values, **and** day-transition + persistence logic. The hooks `useGamePersistence`, `useGameActions`, `useComputedState`, `GameContext` are the older generation and are **not mounted** by the current `App.jsx`. Don't add features to those — they exist to support legacy components and may be removed.

When you modify state shape, update both:
- `TaskState` interface inside `TaskContext.tsx`
- The `raw → s` migration block at the top of the load `useEffect` (defaults for missing fields)
- The day-reset block inside `applyDayTransition` (which keys to clear at midnight)

### Persistence: local-first with cloud sync (`src/utils/storage.ts`)
- Primary store: IndexedDB key `hdx2` (legacy localStorage `hdx2` is auto-migrated on first read)
- Cloud store: Supabase table `public.game_state` keyed by `user_id` (RLS enforced — see `supabase/migration.sql`)
- `syncLoad(userId)` resolves local vs cloud by comparing `lastDate` (the newer one wins)
- `TaskProvider` debounces local saves at 400 ms and cloud saves at 1500 ms after each state change
- Supabase env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (read in `src/lib/supabase.ts`)

### Day transitions
Quests don't reset on a timer — they're rebuilt by `applyDayTransition` whenever the loaded state's `lastDate` doesn't match today (`new Date().toISOString().slice(0, 10)`). This handles streak roll-up, journal archiving, weekly mission progress, dream-strip snapshot, and boss respawn. If you add a daily-reset field, both the `applyDayTransition` reducer in `TaskContext.tsx` and the older `useGamePersistence.ts` need it (the older path uses `toDateString()` rather than ISO — be aware of the format mismatch).

## Architecture: Subsystems

The game has several decoupled subsystems wired through `TaskContext`:

- **Quest engine** (`src/utils/helpers.ts` `buildDay`, `src/constants.ts` `SCHOOL_QUESTS`/`VACATION_QUESTS`/`SIDE_QUESTS`/`FOOTBALL`): Each day picks a deterministic quest set + 2 random side quests + Mon/Wed football. Vacation mode swaps to `VACATION_QUESTS`. Day-of-week and `vacMode` decide composition.
- **Arc Engine** (`src/arcs/`): Narrative episodes ("arcs") composed of `Beat`s — `routine` beats are tied to a `Quest.arcBeatId`, `craft`/`lore` beats are UI-only. Lifecycle: `idle → offered → active → cooldown → idle`. State machine functions are pure (`offerNextArc`, `acceptOffer`, `advanceBeat`, `expireCooldownIfReady`). `TaskContext` hydrates beat IDs onto matching quests via the `useEffect` keyed on `arcEngine.phase`.
- **Companion (Ronki) voice** (`src/companion/`): `VoiceEngine` matches a `VoiceContext` against `voiceLines.ts` candidates; same-kind tags OR, different-kind tags AND. Per-line cooldowns (default 24 h) prevent repetition.
- **Egg system** (`src/data/eggTriggers.ts`, `src/hooks/useEggSystem.ts`): Side-effect hook in `App.jsx` that silently spawns "discovery eggs" when triggers fire, surfaced as `state.pendingEgg` and rendered by `EggOverlay`.
- **Special quests** (`src/data/specialQuests.ts`, `src/hooks/useSpecialQuests.ts`): Idempotent, silent quest completions — recorded in `state.completedSpecialQuests` and grant `xpReward`.
- **Dream Strip** (`src/dream/dreamHighlights.ts`): At day transition, snapshots yesterday's flags (`bossKilledToday`, `allCareDone`, etc.) and builds an ordered highlight list shown the next morning.
- **Zones** (`src/world/zones.ts`): Sanctuary scenes unlocked by `catEvo` thresholds; current art reuses the same background with a CSS `bgFilter`.
- **i18n** (`src/i18n/LanguageContext.tsx`, `de.json`, `en.json`): `useTranslation()` hook with `t(key, vars)`. Default locale is German; English falls back to German for missing keys.

## Conventions That Aren't Obvious

- **`hp` (Heldenpunkte) vs `xp`**: `xp` is lifetime (drives level), `hp` is the spendable balance. Many older actions use `addHP({xp, coins})` to bump both — when adding new reward paths, follow the existing pattern in whichever context you're editing.
- **`drachenEier`** in state is the screen-time minutes balance, not literal "dragon eggs." (The collectible egg system uses `pendingEgg`/`collectedEggs` instead.)
- **Long-press to reach parent controls**: Held for 1500 ms on the `TopBar` opens `ParentalDashboard`. Keep this gesture intact when editing `App.jsx` — it's the only entrypoint.
- **Onboarding gate**: `App.jsx` short-circuits to `Onboarding` whenever `state.onboardingDone === false`. Don't add side effects above this gate that assume a fully-initialized state.
- **Service worker** (`public/sw.js`, registered in `src/main.jsx`): The current registration **wipes all caches and re-registers on every load** — this is intentional (we kept getting stale-content reports on phones). Don't add cache-first strategies without explicit ask.
- **Routing**: The PWA does not use `react-router`. Navigation is the `view` string in `App.jsx` driven by `NavBar` / `setView`. The marketing website *does* use `react-router-dom`.
- **Tailwind v4**: Uses the `@tailwindcss/vite` plugin, not the legacy PostCSS pipeline. Theme tokens (`primary`, `surface`, `on-surface-variant`, etc.) come from the Mystic Meadow design system referenced in `README.md` — when adding components, prefer existing tokens over hardcoded hex.
- **Min tap target 48 px** and `max-w-lg mx-auto` for mobile-first layout. iOS safe-area is honored via `env(safe-area-inset-*)` in `App.jsx` padding.

## Tests

- Vitest + React Testing Library + jsdom. PWA setup file: `src/test/setup.js` (just imports `@testing-library/jest-dom`). Website setup: `website/src/test/setup.ts`.
- Tests live next to source (`*.test.ts(x)`/`*.test.js`). Pure-function modules (`ArcEngine`, `dreamHighlights`, `zones`, `helpers`, `storage`, `VoiceEngine`) have the heaviest coverage; UI components are mostly untested.
- The PWA and the website have **separate vitest configs** — `npm test` only runs PWA tests. Use `npm run test:web` for the marketing site.

## Deployment

- **PWA**: `.github/workflows/deploy.yml` — on push to `main`, builds with `--base /Ronki/` and publishes to `gh-pages` root via `peaceiris/actions-gh-pages` (preserving other files with `keep_files: true`).
- **PWA dev channel**: `.github/workflows/deploy-dev.yml` — on push to `dev`, builds with `--base /Ronki/dev/`, patches `manifest.json` + `sw.js` paths, deploys to `gh-pages/dev/`.
- **Website**: `vercel.json` runs `npm run build:web` → `website/dist/` with SPA rewrite of all paths to `/index.html`.

## Background Docs

`docs/superpowers/specs/` and `docs/superpowers/plans/` contain product/design specs (refocus design, hub refresh, dream strip, website plan, habit-formation research). Read these when editing strategically significant code paths — they explain *why* decisions like "no streaks," "Ronki offers, never nags," and the routine-mediator framing exist.
