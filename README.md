# Ronki

A gamified daily companion app for kids (ages 5-12). Children create a hero, hatch a companion from a mystery egg, and complete daily tasks to earn Heldenpunkte and become the hero of their own story.

**Ronki** = Vietnamese "Rồng" (dragon) + German "-ki" (little) = "little dragon"

## Features

### Core Loop
- **Daily Quests**: Morning routine, school prep, hobbies, and bedtime tasks with XP rewards
- **Companion Evolution**: Pick a mystery egg during onboarding, watch it hatch and evolve through 5 stages (Ei, Baby, Jungtier, Stolz, Legendär)
- **Heldenpunkte (HP)**: Single currency earned from quests, boss battles, and daily bonuses
- **Belohnungsbank**: Spend HP on real-world rewards (parent-configurable)

### Hero Profile
- Kid-focused profile page with avatar, level, and title progression
- **Helden-Werte**: Three character stats computed from daily task performance:
  - **Mut** (Courage) — side quests, hobbies, boss battles
  - **Fokus** (Focus) — school prep completion
  - **Ordnung** (Order) — morning + bedtime routine consistency
- Magischer Rucksack (gear slots), Trophäen & Abzeichen, Thang Long Karte

### Companion System
- 3 egg types (Feuer-Ei, Goldenes Ei, Geist-Ei) chosen during onboarding
- Dragon evolution line with custom illustrated art for each stage
- Hatching celebration with video animation
- Sanctuary (Pflege) tab for companion care: Feed, Pet, Play

### Additional Features
- **Boss Battles**: Weekly boss encounters with HP bar and quest-based damage
- **Journal (Abenteuer-Buch)**: Daily mood tracking, gratitude stickers, memory prompts, achievements
- **Mini-Games**: Memory, Potion Mixing, Cloud Jump, Star Catcher — earn bonus HP
- **Epic Missions**: Multi-day quests for gear rewards
- **Dual Currency**: Heldenpunkte (for rewards) + Screen-Minuten (for digital time)
- **Weather Integration**: Real-time weather with clothing recommendations
- **Parental Dashboard**: Long-press header to access parent controls

## Tech Stack

- **React 18** with functional components and hooks
- **Vite** for build tooling
- **Tailwind CSS v4** with Mystic Meadow design system (Fredoka + Nunito fonts)
- **Supabase** for auth and cloud state sync (per-user saves)
- **IndexedDB** for local persistence
- **Vitest** + React Testing Library for tests

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## Architecture

```
src/
  context/
    AuthContext.tsx         # Supabase auth + login screen
    TaskContext.tsx         # Main state management + cloud sync
  components/
    Hub.jsx                # Home screen with companion + daily summary
    HeroProfile.jsx        # Kid profile with stats, gear, trophies
    TopBar.jsx             # Unified header (avatar, level, HP)
    NavBar.jsx             # 5-tab bottom navigation
    TaskList.jsx           # Daily quest board with epic groups
    Belohnungsbank.jsx     # Reward shop (HP + screen minutes)
    Journal.jsx            # Diary with mood, gratitude, memories
    Sanctuary.jsx          # Companion care (feed/pet/play)
    Onboarding.jsx         # 5-step lore-driven onboarding flow
    Celebration.jsx        # Victory animations
    EpicMissions.jsx       # Multi-day quest chains
    MiniGames.jsx          # Game launcher
    ParentalDashboard.jsx  # Parent controls (long-press access)
    ...
  hooks/
    useGamePersistence.ts  # Load/save/day-transition logic
    useGameActions.ts      # All state mutation actions
    useWeather.ts          # Weather API integration
  utils/
    helpers.ts             # Game mechanics (levels, stages, XP)
    storage.ts             # IndexedDB + Supabase persistence
    sfx.js                 # Sound effects
  constants.ts             # Quest definitions, bosses, gear, badges
  types.ts                 # TypeScript interfaces
  lib/
    supabase.ts            # Supabase client init

public/art/
  companion/               # Dragon evolution art (5 stages + hatching video)
  onboarding/              # Egg + lore illustrations
  hero-default.webp        # Default hero avatar
  hero-journal.webp        # Journal header illustration
  hero-shop.webp           # Shop header illustration
  hero-celebrate-*.webp    # Celebration art
  boss-*.webp              # Boss battle art
  bg-*.webp                # Background textures
```

## Data Persistence

- **Local**: IndexedDB (key: `hdx2`) — works offline
- **Cloud**: Supabase `game_state` table, keyed by `user_id`
- **Sync**: Compares local vs cloud by `lastDate`, picks newer; debounced cloud saves every 1.5s

## Design System

**Mystic Meadow** — warm, nature-inspired theme for kids:
- Primary: `#124346` (deep teal)
- Secondary: `#fcd34d` (golden)
- Surface: `#fff8f1` (warm cream)
- Fonts: Fredoka (headlines), Nunito (body), Plus Jakarta Sans (labels)
- Cards: white with subtle borders and soft shadows
- Min tap target: 48px

## Deployment

Deployed to GitHub Pages on push to `main`. Base path: `/Ronki/`.
