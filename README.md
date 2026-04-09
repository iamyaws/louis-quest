# Ronki

A gamified daily companion app for kids (ages 5-12). Children create a hero, hatch a companion from a mystery egg, and complete daily tasks to earn Heldenpunkte and become the hero of their own story.

**Ronki** = Vietnamese "Rồng" (dragon) + German "-ki" (little) = "little dragon"

## Features

- **Hero Creator**: Human-like avatar with skin tone, hair, eyes, outfit
- **Egg Hatching**: Pick a mystery egg (dragon/wolf/phoenix), hatch it through daily tasks
- **Companion System**: 4 creature types (cat, dragon, wolf, phoenix) with 21 variants total
- **Heldenpunkte**: Single currency earned from tasks, cat care, habits, boss defeats
- **Belohnungsbank**: Spend HP on real-world rewards (parent-configurable)
- **Sammlung**: Items unlock through milestones (streaks, boss defeats, evolution)
- **Daily Habits**: Vitamin D, sibling time, cat care
- **Boss Battles**: Weekly boss with HP bar, quest damage
- **Helden-Tipp**: Daily character affirmations (Sonic, Mario, Ash, etc.)
- **Familienregeln**: Family values view with kid-friendly affirmations
- **Journal**: Mood tracking + reflective questions
- **Weather**: Real-time weather + clothing recommendations
- **Weekly Lunch**: Parent enters school lunch menu (Mo-Fr)
- **Spezial-Missionen**: Parent-configured one-off bonus tasks

## Tech Stack

- **React 18** with functional components and hooks
- **Vite** for build tooling
- **IndexedDB** with localStorage fallback (no backend)
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
  context/          # GameContext (React Context for state management)
  hooks/
    useGamePersistence.ts  # Load/save/day-transition logic
    useGameActions.ts      # All state mutation actions
    useComputedState.ts    # Derived values (level, progress, mood)
    useWeather.ts          # Weather API + clothing recommendations
  components/
    Companion.jsx          # Wrapper: delegates to Cat/Dragon/Wolf/Phoenix
    CatSidekick.jsx        # Cat SVG renderer
    DragonSidekick.jsx     # Dragon SVG renderer
    WolfSidekick.jsx       # Wolf SVG renderer
    PhoenixSidekick.jsx    # Phoenix SVG renderer
    Egg.jsx                # Mystery egg with cracking stages
    HeroSprite.jsx         # Human avatar SVG
    Hub.jsx                # Main dashboard
    QuestBoard.jsx         # Task list + parent mode
    Familienregeln.jsx     # Family values view
    TimeBank.jsx           # Belohnungsbank (reward bank)
    Shop.jsx               # Sammlung (milestone unlocks)
    Room.jsx               # Isometric room
    ...
  utils/
    helpers.ts      # Game mechanics (levels, mood, cat stages)
    storage.ts      # IndexedDB + localStorage persistence
    sfx.ts          # Web Audio API sound synthesis
  constants.ts      # All game data and configuration
  types.ts          # TypeScript interfaces
```

## Deployment

Deployed to GitHub Pages on push to `main`. Base path: `/ronki/`.
