# HeroDex

A gamified daily quest tracker for kids (ages 6-12). Children create a hero and cat sidekick, complete daily chores and habits to earn XP, coins, and rewards through RPG-style progression.

## Features

- Quest completion with XP/coin rewards and streak tracking
- Hero and cat sidekick character customization
- Isometric room decoration with purchasable items
- Weekly missions, rare drops, and surprise chest milestones
- Streak freeze protection (2/month) with comeback system
- Mini-games: Memory game and Spin wheel
- Journal with mood tracking and reflective questions
- Shop for cosmetic items
- School/vacation mode toggle
- Data export/import for backup

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
  hooks/            # Custom hooks
    useGamePersistence.js  # Load/save/day-transition logic
    useGameActions.js      # All state mutation actions
    useComputedState.js    # Derived values (level, progress, mood)
  components/       # React components
    ErrorBoundary.jsx      # Crash recovery UI
    Hub.jsx                # Main dashboard
    QuestBoard.jsx         # Quest list and completion
    Room.jsx               # Isometric room with decorations
    ...
  utils/
    helpers.js      # Game mechanics (levels, mood, sky gradients)
    storage.js      # IndexedDB + localStorage persistence
    sfx.js          # Web Audio API sound synthesis
  constants.js      # All game data and configuration
```

## Deployment

Deployed to GitHub Pages via GitHub Actions on push to `main`. Base path: `/louis-quest/`.
