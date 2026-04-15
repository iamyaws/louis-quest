# Ronki Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Ronki marketing website — a 4-page German-first site with Supabase-backed waitlist and a single-switch coordinated drop, living in a subfolder of the Ronki app repo.

**Architecture:** Subfolder build under `~/louis-quest/website/` with its own Vite config, sharing the root `package.json`. React 18 + Vite + Tailwind v4 + `motion` for scroll-linked storytelling + React Router v6 for client-side routing. Supabase waitlist table backs a single email capture form. A `LAUNCH_STATE` config flag flips the hero CTA from "Auf die Warteliste" to "Kostenlos testen" on drop day. Painterly visual direction matches the app; design tokens shared via a CSS module.

**Tech Stack:** React 18, Vite 5.4.19, Tailwind v4.2.2 (`@tailwindcss/vite`), `motion` 12.38.0, React Router v6, `@supabase/supabase-js` 2.103.0, TypeScript, Vitest + Testing Library.

**Companion spec:** [`docs/superpowers/specs/2026-04-15-ronki-website-design.md`](../specs/2026-04-15-ronki-website-design.md)

---

## File Structure

Files created or modified by this plan:

### New files (website subfolder)

```
website/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml           (generated at build)
│   └── images/               (painterly illustrations — placeholder-first)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes.tsx
│   ├── config/
│   │   └── launch-state.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── waitlist.ts
│   │   └── analytics-noop.ts  (placeholder — documents the decision)
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── RealQuote.tsx
│   │   ├── Pillars.tsx
│   │   ├── ArcStoryboard.tsx
│   │   ├── AntiFeatures.tsx
│   │   ├── WaitlistCTA.tsx
│   │   ├── Footer.tsx
│   │   ├── PageMeta.tsx
│   │   └── SectionHeading.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Science.tsx
│   │   ├── Impressum.tsx
│   │   ├── Datenschutz.tsx
│   │   └── NotFound.tsx
│   ├── styles/
│   │   └── globals.css
│   └── test/
│       └── setup.ts
└── tests/
    ├── launch-state.test.ts
    ├── waitlist.test.ts
    ├── WaitlistCTA.test.tsx
    └── pages.test.tsx
```

### Modified files (root)

- `package.json` — add `react-router-dom`, `@types/react-router-dom` (if needed), and `dev:web` / `build:web` / `preview:web` scripts
- `.gitignore` — add `website/dist/`

### New Supabase migration

- `supabase/migrations/<timestamp>_waitlist_table.sql`

---

## Conventions

- **Language:** TypeScript + TSX for all website code (the app uses JSX; the website is a greenfield enough that starting in TS is worth it).
- **Component style:** Function components with explicit prop types. No `React.FC`.
- **Styling:** Tailwind utility classes + a small `globals.css` for painterly tokens.
- **Testing:** Vitest + React Testing Library. TDD for logic (launch state, waitlist API, form validation). Integration tests for pages render without error. No snapshot tests — visual verification via local preview.
- **Commits:** Conventional (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`). One commit per task unless a task has a natural sub-commit boundary.
- **Branch:** Work on `dev` (current app branch). No separate branch needed — website lives in its own subfolder and doesn't touch app code.
- **Local preview:** Marc prefers local preview over deploy-to-verify. The website dev server runs on port **5174** (app uses 5173). Always start it fresh after scaffolding changes.
- **Asset placeholders:** Final painterly illustrations will be produced separately. Every image reference in this plan uses a clearly-named placeholder path (`/images/placeholder-<name>.webp`). A final task swaps placeholders for real assets.

---

## Task 1: Add website dependencies and npm scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install new dependencies**

Run from `~/louis-quest/`:

```bash
npm install react-router-dom@^6.28.0
```

Expected: `react-router-dom` appears under `dependencies` in `package.json`. No TypeScript types package needed — `react-router-dom` v6 ships its own types.

- [ ] **Step 2: Add website build scripts**

Edit `package.json`'s `scripts` block to add the three website scripts (keep existing app scripts unchanged):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev:web": "vite --config website/vite.config.ts",
    "build:web": "vite build --config website/vite.config.ts",
    "preview:web": "vite preview --config website/vite.config.ts",
    "test:web": "vitest run --config website/vite.config.ts"
  }
}
```

- [ ] **Step 3: Add website build output to .gitignore**

Open `.gitignore` and append:

```
website/dist/
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore(website): add react-router-dom and website build scripts"
```

---

## Task 2: Scaffold website directory with Vite config and entry HTML

**Files:**
- Create: `website/vite.config.ts`
- Create: `website/tsconfig.json`
- Create: `website/index.html`
- Create: `website/src/main.tsx`
- Create: `website/src/App.tsx`
- Create: `website/src/styles/globals.css`

- [ ] **Step 1: Create `website/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname),
  base: '/',
  plugins: [tailwindcss(), react()],
  server: {
    port: 5174,
    open: true,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: path.resolve(__dirname, 'src/test/setup.ts'),
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 2: Create `website/tsconfig.json`**

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

- [ ] **Step 3: Create `website/index.html`**

```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ronki — Der Drachen-Gefährte für Kinder-Routinen</title>
    <meta name="description" content="Ronki trägt die Routine mit. Ein Drachen-Gefährte, der Kinder durch den Alltag begleitet — ohne Streaks, ohne Werbung, ohne Dark Patterns." />
  </head>
  <body class="bg-parchment text-ink antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `website/src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

- [ ] **Step 5: Create placeholder `website/src/App.tsx`**

```tsx
export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p className="text-xl">Ronki website scaffold is live.</p>
    </main>
  );
}
```

- [ ] **Step 6: Create `website/src/styles/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-parchment: #f7f1e3;
  --color-ink: #2c2418;
  --color-moss: #6b8e4e;
  --color-ochre: #c48a3a;
  --color-plum: #6b3a5c;
  --color-cream: #faf6ea;
  --font-display: "Playfair Display", Georgia, serif;
  --font-body: "Source Serif Pro", Georgia, serif;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

> **Note on fonts:** The `--font-display` and `--font-body` values above reference system-fallback-safe serifs. If the app uses specific painterly/body fonts, replace these values with the app's fonts. Font self-hosting happens in Task 26.

- [ ] **Step 7: Verify dev server starts**

Run from `~/louis-quest/`:

```bash
npm run dev:web
```

Expected: Vite starts on port 5174, browser opens at `http://localhost:5174/`, page shows "Ronki website scaffold is live." on cream background. No console errors.

Stop the server with Ctrl+C.

- [ ] **Step 8: Commit**

```bash
git add website/ package.json
git commit -m "feat(website): scaffold Vite + React + Tailwind v4 + Router"
```

---

## Task 3: Set up test infrastructure

**Files:**
- Create: `website/src/test/setup.ts`
- Create: `website/tests/smoke.test.tsx`

- [ ] **Step 1: Create test setup file**

`website/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 2: Write a smoke test**

`website/tests/smoke.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

describe('App smoke test', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/ronki website scaffold/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test and verify it passes**

Run from `~/louis-quest/`:

```bash
npm run test:web
```

Expected: 1 passed. If it fails with a module resolution error, double-check the `include` glob in `website/vite.config.ts` matches the actual path.

- [ ] **Step 4: Commit**

```bash
git add website/src/test website/tests
git commit -m "test(website): smoke test infrastructure"
```

---

## Task 4: Routing and page placeholders

**Files:**
- Create: `website/src/routes.tsx`
- Create: `website/src/pages/Home.tsx`
- Create: `website/src/pages/HowItWorks.tsx`
- Create: `website/src/pages/Science.tsx`
- Create: `website/src/pages/Impressum.tsx`
- Create: `website/src/pages/Datenschutz.tsx`
- Create: `website/src/pages/NotFound.tsx`
- Modify: `website/src/App.tsx`

- [ ] **Step 1: Create placeholder page components**

Each page gets a minimal placeholder with its H1. Create all six:

`website/src/pages/Home.tsx`:

```tsx
export default function Home() {
  return (
    <main>
      <h1>Ronki trägt die Routine mit.</h1>
      <p>Homepage placeholder.</p>
    </main>
  );
}
```

`website/src/pages/HowItWorks.tsx`:

```tsx
export default function HowItWorks() {
  return (
    <main>
      <h1>Wie Ronki arbeitet</h1>
      <p>How it works placeholder.</p>
    </main>
  );
}
```

`website/src/pages/Science.tsx`:

```tsx
export default function Science() {
  return (
    <main>
      <h1>Die Wissenschaft hinter Ronki</h1>
      <p>Science placeholder.</p>
    </main>
  );
}
```

`website/src/pages/Impressum.tsx`:

```tsx
export default function Impressum() {
  return (
    <main>
      <h1>Impressum</h1>
      <p>Impressum placeholder.</p>
    </main>
  );
}
```

`website/src/pages/Datenschutz.tsx`:

```tsx
export default function Datenschutz() {
  return (
    <main>
      <h1>Datenschutz</h1>
      <p>Datenschutz placeholder.</p>
    </main>
  );
}
```

`website/src/pages/NotFound.tsx`:

```tsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-display">Hier ist Ronki nicht zu Hause.</h1>
      <p>Die Seite, die du suchst, gibt es nicht.</p>
      <Link to="/" className="underline">Zurück zur Startseite</Link>
    </main>
  );
}
```

- [ ] **Step 2: Create route config**

`website/src/routes.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Science from './pages/Science';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import NotFound from './pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wie-es-funktioniert" element={<HowItWorks />} />
      <Route path="/wissenschaft" element={<Science />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

- [ ] **Step 3: Wire routes into App**

Replace `website/src/App.tsx`:

```tsx
import { AppRoutes } from './routes';

export default function App() {
  return <AppRoutes />;
}
```

- [ ] **Step 4: Update smoke test**

Update `website/tests/smoke.test.tsx` to match the new homepage placeholder:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

describe('App smoke test', () => {
  it('renders homepage at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/ronki trägt die routine/i);
  });

  it('renders 404 for unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/hier ist ronki nicht zu hause/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run tests**

```bash
npm run test:web
```

Expected: 2 passed.

- [ ] **Step 6: Verify in local preview**

```bash
npm run dev:web
```

In the browser:
- `/` → "Ronki trägt die Routine mit."
- `/wie-es-funktioniert` → "Wie Ronki arbeitet"
- `/wissenschaft` → "Die Wissenschaft hinter Ronki"
- `/impressum` → "Impressum"
- `/datenschutz` → "Datenschutz"
- `/banana` → "Hier ist Ronki nicht zu Hause."

Stop the server.

- [ ] **Step 7: Commit**

```bash
git add website/
git commit -m "feat(website): route scaffolding for all pages"
```

---

## Task 5: Launch state config (TDD)

**Files:**
- Create: `website/src/config/launch-state.ts`
- Create: `website/tests/launch-state.test.ts`

- [ ] **Step 1: Write the failing test**

`website/tests/launch-state.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getLaunchCopy, LAUNCH_STATE } from '../src/config/launch-state';

describe('launch state', () => {
  it('exports a valid LAUNCH_STATE value', () => {
    expect(['waitlist', 'live']).toContain(LAUNCH_STATE);
  });

  it('returns waitlist copy when state is waitlist', () => {
    const copy = getLaunchCopy('waitlist');
    expect(copy.ctaLabel).toBe('Auf die Warteliste');
    expect(copy.ctaAction).toBe('waitlist');
    expect(copy.footerMicro).toMatch(/warteliste/i);
  });

  it('returns live copy when state is live', () => {
    const copy = getLaunchCopy('live');
    expect(copy.ctaLabel).toBe('Kostenlos testen');
    expect(copy.ctaAction).toBe('install');
    expect(copy.footerMicro).toMatch(/browser/i);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

```bash
npm run test:web
```

Expected: FAIL — `Cannot find module '../src/config/launch-state'`.

- [ ] **Step 3: Implement the config**

`website/src/config/launch-state.ts`:

```ts
export type LaunchState = 'waitlist' | 'live';

export const LAUNCH_STATE: LaunchState = 'waitlist';

export type LaunchCopy = {
  ctaLabel: string;
  ctaAction: 'waitlist' | 'install';
  ctaHelper: string;
  footerMicro: string;
};

const COPY: Record<LaunchState, LaunchCopy> = {
  waitlist: {
    ctaLabel: 'Auf die Warteliste',
    ctaAction: 'waitlist',
    ctaHelper: 'Eine einzige E-Mail — am Start-Tag. Sonst nichts.',
    footerMicro: 'Ronki startet bald. Du erfährst es als eine:r der Ersten, wenn du auf die Warteliste wartest.',
  },
  live: {
    ctaLabel: 'Kostenlos testen',
    ctaAction: 'install',
    ctaHelper: 'Direkt im Browser. Kein App Store nötig.',
    footerMicro: 'Ronki läuft direkt im Browser — installierbar auf Handy und Tablet.',
  },
};

export function getLaunchCopy(state: LaunchState = LAUNCH_STATE): LaunchCopy {
  return COPY[state];
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:web
```

Expected: all tests pass (smoke + 3 launch-state).

- [ ] **Step 5: Commit**

```bash
git add website/src/config website/tests/launch-state.test.ts
git commit -m "feat(website): launch-state config with waitlist/live copy swap"
```

---

## Task 6: Supabase waitlist migration

**Files:**
- Create: `supabase/migrations/<timestamp>_waitlist_table.sql`

- [ ] **Step 1: Generate migration file**

Determine timestamp: use UTC `YYYYMMDDHHMMSS` format. For example: `20260415170000`.

Create `supabase/migrations/20260415170000_waitlist_table.sql`:

```sql
-- Waitlist table for Ronki website pre-launch signups.
-- Parent-facing only. No child data. Delete 30 days after drop-day email unless converted.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  source text,
  locale text not null default 'de',
  notified_at timestamptz
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- Public (anon) can insert new entries, but nothing else.
create policy "public insert waitlist"
  on public.waitlist
  for insert
  to anon
  with check (true);

-- Only service_role can read / update / delete.
-- (No explicit select/update/delete policies for anon → all denied by RLS default.)

comment on table public.waitlist is 'Ronki website pre-launch waitlist. Parent emails only. GDPR-K compliant.';
comment on column public.waitlist.source is 'Optional referrer or utm_source, for understanding where signups come from.';
comment on column public.waitlist.notified_at is 'Set when the single drop-day email has been sent.';
```

- [ ] **Step 2: Apply migration locally (if using local Supabase)**

If the project uses Supabase CLI locally:

```bash
cd /c/Users/öööö/louis-quest
npx supabase db reset --linked
# or
npx supabase migration up
```

If using hosted Supabase only, apply via the dashboard SQL editor by pasting the migration content.

Verify: the `waitlist` table exists in the Supabase dashboard, with RLS enabled, and a single `public insert waitlist` policy.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260415170000_waitlist_table.sql
git commit -m "feat(waitlist): supabase table with RLS for public inserts only"
```

---

## Task 7: Supabase client module (shared)

**Files:**
- Create: `website/src/lib/supabase.ts`

- [ ] **Step 1: Create the client module**

`website/src/lib/supabase.ts`:

```ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
  );
}

export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: { persistSession: false },
});
```

- [ ] **Step 2: Ensure env vars are set**

Check `~/louis-quest/.env` contains:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

The Vite dev server automatically loads `.env` from the project root. The website's Vite config inherits this because `root` is set to the website subfolder but the process runs from `~/louis-quest/` where `.env` lives.

> **If env resolution has issues:** add `envDir: path.resolve(__dirname, '..')` to `website/vite.config.ts` to force Vite to load `.env` from the repo root.

- [ ] **Step 3: Commit**

```bash
git add website/src/lib/supabase.ts
git commit -m "feat(website): supabase client module"
```

---

## Task 8: Waitlist API client (TDD)

**Files:**
- Create: `website/src/lib/waitlist.ts`
- Create: `website/tests/waitlist.test.ts`

- [ ] **Step 1: Write failing tests**

`website/tests/waitlist.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidEmail, submitWaitlistEmail } from '../src/lib/waitlist';

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../src/lib/supabase';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('marc@example.com')).toBe(true);
    expect(isValidEmail('first.last+tag@sub.example.co.uk')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@no-local.com')).toBe(false);
    expect(isValidEmail('no-at-sign.com')).toBe(false);
    expect(isValidEmail('trailing@')).toBe(false);
  });
});

describe('submitWaitlistEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid email without touching Supabase', async () => {
    const result = await submitWaitlistEmail('not-email');
    expect(result).toEqual({ ok: false, reason: 'invalid' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns ok on successful insert', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert });

    const result = await submitWaitlistEmail('marc@example.com');

    expect(result).toEqual({ ok: true });
    expect(supabase.from).toHaveBeenCalledWith('waitlist');
    expect(insert).toHaveBeenCalledWith({ email: 'marc@example.com', locale: 'de' });
  });

  it('returns duplicate on unique-violation error', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });
    (supabase.from as any).mockReturnValue({ insert });

    const result = await submitWaitlistEmail('marc@example.com');

    expect(result).toEqual({ ok: false, reason: 'duplicate' });
  });

  it('returns error on generic failure', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { code: '42501', message: 'permission denied' },
    });
    (supabase.from as any).mockReturnValue({ insert });

    const result = await submitWaitlistEmail('marc@example.com');

    expect(result).toEqual({ ok: false, reason: 'error' });
  });

  it('normalizes email to lowercase and trims whitespace', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert });

    await submitWaitlistEmail('  Marc@Example.COM  ');

    expect(insert).toHaveBeenCalledWith({ email: 'marc@example.com', locale: 'de' });
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

```bash
npm run test:web
```

Expected: FAIL — `Cannot find module '../src/lib/waitlist'`.

- [ ] **Step 3: Implement the waitlist module**

`website/src/lib/waitlist.ts`:

```ts
import { supabase } from './supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'duplicate' | 'error' };

export async function submitWaitlistEmail(
  rawEmail: string,
  locale: 'de' | 'en' = 'de',
): Promise<WaitlistResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, reason: 'invalid' };
  }

  const { error } = await supabase.from('waitlist').insert({ email, locale });

  if (!error) return { ok: true };
  if (error.code === '23505') return { ok: false, reason: 'duplicate' };
  return { ok: false, reason: 'error' };
}
```

- [ ] **Step 4: Run tests and verify all pass**

```bash
npm run test:web
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add website/src/lib/waitlist.ts website/tests/waitlist.test.ts
git commit -m "feat(website): waitlist submit with validation, dedup, TDD"
```

---

## Task 9: WaitlistCTA component

**Files:**
- Create: `website/src/components/WaitlistCTA.tsx`
- Create: `website/tests/WaitlistCTA.test.tsx`

- [ ] **Step 1: Write failing tests**

`website/tests/WaitlistCTA.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaitlistCTA } from '../src/components/WaitlistCTA';

vi.mock('../src/lib/waitlist', () => ({
  submitWaitlistEmail: vi.fn(),
  isValidEmail: (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
}));

import { submitWaitlistEmail } from '../src/lib/waitlist';

describe('WaitlistCTA — waitlist state', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders waitlist copy when state is waitlist', () => {
    render(<WaitlistCTA launchState="waitlist" />);
    expect(screen.getByRole('button', { name: /auf die warteliste/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
  });

  it('shows success message after valid submission', async () => {
    (submitWaitlistEmail as any).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'marc@example.com');
    await user.click(screen.getByRole('button', { name: /auf die warteliste/i }));

    expect(await screen.findByText(/danke/i)).toBeInTheDocument();
  });

  it('shows duplicate message when email already exists', async () => {
    (submitWaitlistEmail as any).mockResolvedValue({ ok: false, reason: 'duplicate' });
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'marc@example.com');
    await user.click(screen.getByRole('button', { name: /auf die warteliste/i }));

    expect(await screen.findByText(/bist du schon/i)).toBeInTheDocument();
  });

  it('shows invalid-email inline error without calling API', async () => {
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'not-email');
    await user.click(screen.getByRole('button', { name: /auf die warteliste/i }));

    expect(await screen.findByText(/bitte gib eine gültige/i)).toBeInTheDocument();
    expect(submitWaitlistEmail).not.toHaveBeenCalled();
  });

  it('shows generic error on server failure', async () => {
    (submitWaitlistEmail as any).mockResolvedValue({ ok: false, reason: 'error' });
    const user = userEvent.setup();
    render(<WaitlistCTA launchState="waitlist" />);

    await user.type(screen.getByLabelText(/e-mail/i), 'marc@example.com');
    await user.click(screen.getByRole('button', { name: /auf die warteliste/i }));

    expect(await screen.findByText(/etwas ist schiefgegangen/i)).toBeInTheDocument();
  });
});

describe('WaitlistCTA — live state', () => {
  it('renders a link to install instead of a form when live', () => {
    render(<WaitlistCTA launchState="live" />);
    expect(screen.getByRole('link', { name: /kostenlos testen/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/e-mail/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

```bash
npm run test:web
```

Expected: FAIL — component doesn't exist.

- [ ] **Step 3: Implement WaitlistCTA**

`website/src/components/WaitlistCTA.tsx`:

```tsx
import { useState, FormEvent } from 'react';
import { submitWaitlistEmail } from '../lib/waitlist';
import { getLaunchCopy, LaunchState } from '../config/launch-state';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'duplicate' }
  | { kind: 'invalid' }
  | { kind: 'error' };

type Props = {
  launchState: LaunchState;
  appUrl?: string;
};

export function WaitlistCTA({ launchState, appUrl = '/app' }: Props) {
  const copy = getLaunchCopy(launchState);

  if (launchState === 'live') {
    return (
      <div className="flex flex-col items-start gap-2">
        <a
          href={appUrl}
          className="inline-block rounded-xl bg-moss px-6 py-3 text-cream font-display text-lg shadow-md hover:shadow-lg transition-shadow"
        >
          {copy.ctaLabel}
        </a>
        <p className="text-sm opacity-75">{copy.ctaHelper}</p>
      </div>
    );
  }

  return <WaitlistForm copy={copy} />;
}

function WaitlistForm({ copy }: { copy: ReturnType<typeof getLaunchCopy> }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'submitting' });
    const result = await submitWaitlistEmail(email);
    if (result.ok) {
      setStatus({ kind: 'success' });
      setEmail('');
      return;
    }
    if (result.reason === 'invalid') setStatus({ kind: 'invalid' });
    else if (result.reason === 'duplicate') setStatus({ kind: 'duplicate' });
    else setStatus({ kind: 'error' });
  }

  if (status.kind === 'success') {
    return (
      <p role="status" className="text-lg font-display">
        Danke — wir melden uns einmal, am Start-Tag.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md w-full" noValidate>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">E-Mail</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className="rounded-lg border border-ink/20 bg-cream px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-moss"
          required
        />
      </label>
      <button
        type="submit"
        disabled={status.kind === 'submitting'}
        className="rounded-xl bg-moss px-6 py-3 text-cream font-display text-lg shadow-md hover:shadow-lg disabled:opacity-50 transition-shadow"
      >
        {status.kind === 'submitting' ? '…' : copy.ctaLabel}
      </button>
      <p className="text-sm opacity-75">{copy.ctaHelper}</p>
      {status.kind === 'invalid' && (
        <p role="alert" className="text-sm text-plum">Bitte gib eine gültige E-Mail-Adresse ein.</p>
      )}
      {status.kind === 'duplicate' && (
        <p role="alert" className="text-sm text-plum">Bist du schon auf der Liste — wir melden uns am Start-Tag.</p>
      )}
      {status.kind === 'error' && (
        <p role="alert" className="text-sm text-plum">Etwas ist schiefgegangen. Bitte versuch's gleich noch mal.</p>
      )}
    </form>
  );
}
```

- [ ] **Step 4: Install user-event for tests**

If `@testing-library/user-event` isn't installed:

```bash
npm install -D @testing-library/user-event
```

- [ ] **Step 5: Run tests**

```bash
npm run test:web
```

Expected: all WaitlistCTA tests pass.

- [ ] **Step 6: Commit**

```bash
git add website/src/components/WaitlistCTA.tsx website/tests/WaitlistCTA.test.tsx package.json package-lock.json
git commit -m "feat(website): waitlist CTA with form states and launch-state swap"
```

---

## Task 10: PageMeta component for per-page meta tags

**Files:**
- Create: `website/src/components/PageMeta.tsx`

- [ ] **Step 1: Implement PageMeta**

React doesn't automatically hoist `<title>`/`<meta>` into `<head>` in v18. Since the site is pre-rendered at build time ideally, a lightweight effect-based approach is sufficient for client-side nav.

`website/src/components/PageMeta.tsx`:

```tsx
import { useEffect } from 'react';

type Props = {
  title: string;
  description: string;
  ogImage?: string;
  canonicalPath?: string;
};

export function PageMeta({ title, description, ogImage, canonicalPath }: Props) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    if (ogImage) setMeta('og:image', ogImage, 'property');
    if (canonicalPath) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = `https://ronki.de${canonicalPath}`;
    }
  }, [title, description, ogImage, canonicalPath]);

  return null;
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/PageMeta.tsx
git commit -m "feat(website): PageMeta component for per-route meta tags"
```

---

## Task 11: SectionHeading component (shared)

**Files:**
- Create: `website/src/components/SectionHeading.tsx`

- [ ] **Step 1: Implement SectionHeading**

A small shared helper so all page sections have consistent vertical rhythm.

`website/src/components/SectionHeading.tsx`:

```tsx
import { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  children: ReactNode;
  level?: 2 | 3;
  id?: string;
};

export function SectionHeading({ eyebrow, children, level = 2, id }: Props) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <header className="flex flex-col gap-2 mb-8">
      {eyebrow && (
        <p className="text-sm uppercase tracking-widest text-ochre font-medium">{eyebrow}</p>
      )}
      <Tag id={id} className="text-3xl sm:text-4xl font-display leading-tight">
        {children}
      </Tag>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/SectionHeading.tsx
git commit -m "feat(website): SectionHeading shared component"
```

---

## Task 12: Footer component

**Files:**
- Create: `website/src/components/Footer.tsx`

- [ ] **Step 1: Implement Footer**

`website/src/components/Footer.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { getLaunchCopy, LAUNCH_STATE } from '../config/launch-state';

export function Footer() {
  const copy = getLaunchCopy(LAUNCH_STATE);
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink/10 bg-cream/60 py-10 px-6 mt-24">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <p className="text-sm opacity-75 max-w-2xl">{copy.footerMicro}</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-6 text-sm">
          <Link to="/" className="underline">Start</Link>
          <Link to="/wie-es-funktioniert" className="underline">Wie es funktioniert</Link>
          <Link to="/wissenschaft" className="underline">Wissenschaft</Link>
          <Link to="/impressum" className="underline">Impressum</Link>
          <Link to="/datenschutz" className="underline">Datenschutz</Link>
          <a href="mailto:hallo@ronki.de" className="underline">Kontakt</a>
        </nav>
        <p className="text-xs opacity-60">
          © {year} Ronki. Ein unabhängiges Projekt. Keine Werbe-Partner, keine Tracker.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/Footer.tsx
git commit -m "feat(website): footer with nav and no-tracker disclosure"
```

---

## Task 13: Hero section

**Files:**
- Create: `website/src/components/Hero.tsx`

- [ ] **Step 1: Implement Hero**

`website/src/components/Hero.tsx`:

```tsx
import { motion } from 'motion/react';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col gap-6"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display leading-[1.05] tracking-tight">
            Ronki trägt die Routine mit.
          </h1>
          <p className="text-lg sm:text-xl max-w-xl opacity-85 leading-relaxed">
            Ein Drachen-Gefährte, der Kinder durch den Alltag begleitet — damit du nicht zum tausendsten Mal „Zähne putzen!" rufen musst.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <WaitlistCTA launchState={LAUNCH_STATE} />
            <a href="#wie-ronki-arbeitet" className="text-sm underline opacity-75 hover:opacity-100">
              Wie Ronki arbeitet →
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative"
        >
          <img
            src="/images/placeholder-hero-dragon.webp"
            alt="Ronki, der Drachen-Gefährte, in einer sanft gemalten Szene seines Sanctuary."
            className="w-full h-auto rounded-2xl shadow-lg"
            loading="eager"
            width={800}
            height={900}
          />
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add placeholder image**

Create `website/public/images/placeholder-hero-dragon.webp` — for now, use any temporary painterly-ish placeholder (even a solid cream tile with "HERO" text is fine; the final asset swap happens in Task 27). Or save a simple placeholder SVG and reference it as `.svg` in the Hero src attribute temporarily.

Quick placeholder: save a 800×900 PNG/WebP to that path. On macOS/Linux an ImageMagick one-liner works; on Windows, use any graphics tool or skip the file and accept the broken image during dev — it will not block subsequent tasks.

- [ ] **Step 3: Commit**

```bash
git add website/src/components/Hero.tsx website/public/images/
git commit -m "feat(website): hero section with motion entrance"
```

---

## Task 14: RealQuote section

**Files:**
- Create: `website/src/components/RealQuote.tsx`

- [ ] **Step 1: Implement RealQuote**

`website/src/components/RealQuote.tsx`:

```tsx
export function RealQuote() {
  return (
    <section className="px-6 py-20 bg-cream/40" aria-labelledby="real-quote-heading">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 items-start">
        <p id="real-quote-heading" className="text-sm uppercase tracking-widest text-ochre font-medium">
          Was Eltern wirklich erleben
        </p>
        <blockquote className="text-2xl sm:text-3xl font-display leading-snug">
          „Ronki nimmt uns tausend Diskussionen ab. Mein Sohn kümmert sich mit dem Drachen um seine Routinen — und fühlt sich dabei selbstständig, nicht kontrolliert."
        </blockquote>
        <footer className="flex items-center gap-3 text-sm opacity-75">
          <span className="w-10 h-10 rounded-full bg-ochre/30 flex items-center justify-center font-display">M</span>
          <span>Marc, Vater von Louis (7)</span>
        </footer>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/RealQuote.tsx
git commit -m "feat(website): real parent quote section"
```

---

## Task 15: Three Pillars section

**Files:**
- Create: `website/src/components/Pillars.tsx`

- [ ] **Step 1: Implement Pillars**

`website/src/components/Pillars.tsx`:

```tsx
import { SectionHeading } from './SectionHeading';

const PILLARS = [
  {
    title: 'Ronki fragt, nie nervt.',
    body: 'Der Drache bietet Routinen als kleine Geschichten an — keine Erinnerungen, keine Streaks, kein „du hast's gebrochen". Kinder wählen ihr Tempo selbst.',
    image: '/images/placeholder-pillar-offers.webp',
    alt: 'Ronki reicht dem Kind eine kleine Schriftrolle — ein sanftes Angebot, keine Mahnung.',
  },
  {
    title: 'Das Sanctuary wächst mit.',
    body: 'Jede fertige Routine hinterlässt Spuren in Ronkis Welt. Fortschritt wird zu einem Ort, den das Kind besucht — nicht zu einem Zähler, den es fürchtet zu verlieren.',
    image: '/images/placeholder-pillar-sanctuary.webp',
    alt: 'Ronkis Sanctuary füllt sich über Wochen mit Karten, Kleinwesen und Erinnerungsstücken.',
  },
  {
    title: 'Nach Kinderentwicklung gebaut.',
    body: 'Gebaut auf AAP 2026, UNICEF RITEC-8, D4CR und Self-Determination Theory. Keine Loot-Boxen, keine variablen Belohnungen, keine FOMO-Mechaniken. Nie.',
    image: '/images/placeholder-pillar-science.webp',
    alt: 'Ein aufgeschlagenes Buch neben Ronki — die wissenschaftlichen Grundlagen sind sichtbar.',
  },
];

export function Pillars() {
  return (
    <section id="wie-ronki-arbeitet" className="px-6 py-24" aria-labelledby="pillars-heading">
      <div className="max-w-6xl mx-auto">
        <SectionHeading id="pillars-heading" eyebrow="Die drei Säulen">
          Warum Ronki anders ist.
        </SectionHeading>
        <div className="grid gap-10 md:grid-cols-3 mt-8">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="flex flex-col gap-4">
              <img
                src={pillar.image}
                alt={pillar.alt}
                className="w-full aspect-[4/3] object-cover rounded-2xl shadow-sm"
                loading="lazy"
                width={480}
                height={360}
              />
              <h3 className="text-2xl font-display leading-tight">{pillar.title}</h3>
              <p className="opacity-85 leading-relaxed">{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/Pillars.tsx
git commit -m "feat(website): three pillars section"
```

---

## Task 16: ArcStoryboard section (motion scroll)

**Files:**
- Create: `website/src/components/ArcStoryboard.tsx`

- [ ] **Step 1: Implement ArcStoryboard**

Scroll-linked reveal of three beats. Uses `motion`'s `useScroll` + `useTransform`. Fallback for `prefers-reduced-motion` via CSS.

`website/src/components/ArcStoryboard.tsx`:

```tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { SectionHeading } from './SectionHeading';

const BEATS = [
  {
    label: 'Morgen · Routine-Bogen',
    title: 'Ronki bittet ums Zähneputzen — als Teil der Geschichte.',
    body: 'Louis tickt das Zähneputzen ab. Ronki bedankt sich: „Die Karte nimmt Gestalt an." Keine Erinnerung. Kein Druck.',
    image: '/images/placeholder-beat-morning.webp',
  },
  {
    label: 'Nachmittag · Bastel-Bogen',
    title: 'Eine Karte vom Garten malen.',
    body: 'Ronki schlägt vor: „Heute ist unser Schritt, eine Karte zu malen." Vorlage drucken, malen, zeigen, „Ich hab's geschafft" tippen.',
    image: '/images/placeholder-beat-afternoon.webp',
  },
  {
    label: 'Abend · Lore-Bogen',
    title: 'Eine kleine Geschichte im Sanctuary.',
    body: 'Louis besucht Ronki. Mini-Haustiere streicheln, Eier kontrollieren, ein paar Zeilen Geschichte lesen. Dann ins Bett.',
    image: '/images/placeholder-beat-evening.webp',
  },
];

export function ArcStoryboard() {
  return (
    <section className="px-6 py-24 bg-cream/40" aria-labelledby="storyboard-heading">
      <div className="max-w-6xl mx-auto">
        <SectionHeading id="storyboard-heading" eyebrow="Wie ein Tag mit Ronki aussieht">
          Drei kleine Bögen, die einen Tag tragen.
        </SectionHeading>
        <div className="flex flex-col gap-24 mt-12">
          {BEATS.map((beat, i) => (
            <Beat key={beat.label} beat={beat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Beat({ beat, index }: { beat: typeof BEATS[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.3, 1, 1, 0.3]);

  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      style={reducedMotion ? undefined : { y, opacity }}
      className={`grid gap-8 md:grid-cols-2 items-center ${isEven ? '' : 'md:[&>*:first-child]:order-2'}`}
    >
      <img
        src={beat.image}
        alt={beat.title}
        className="w-full aspect-[4/3] object-cover rounded-2xl shadow-md"
        loading="lazy"
        width={640}
        height={480}
      />
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-widest text-ochre font-medium">{beat.label}</p>
        <h3 className="text-2xl sm:text-3xl font-display leading-tight">{beat.title}</h3>
        <p className="opacity-85 leading-relaxed">{beat.body}</p>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify motion import path**

`motion/react` is the correct import path for the v12 `motion` package. If the import fails at build, try `from 'motion'` instead — check the installed version's README.

- [ ] **Step 3: Commit**

```bash
git add website/src/components/ArcStoryboard.tsx
git commit -m "feat(website): arc storyboard with scroll-linked motion, reduced-motion fallback"
```

---

## Task 17: AntiFeatures section (homepage version)

**Files:**
- Create: `website/src/components/AntiFeatures.tsx`

- [ ] **Step 1: Implement AntiFeatures**

`website/src/components/AntiFeatures.tsx`:

```tsx
import { SectionHeading } from './SectionHeading';
import { Link } from 'react-router-dom';

const ITEMS = [
  { label: 'Keine Streaks, die reißen können.', detail: 'Kontinuität zeigt sich räumlich im Sanctuary — nicht als Zähler.' },
  { label: 'Keine Werbung. Nie.', detail: 'Ronki verdient kein Geld mit der Aufmerksamkeit von Kindern.' },
  { label: 'Keine Loot-Boxen, keine Glücksspiel-Mechaniken.', detail: 'Belohnungen sind vorhersehbar und an reale Aktionen gebunden.' },
  { label: 'Keine Push-Nachrichten, die nerven.', detail: 'Ronki wartet im Sanctuary — er kommt nicht hinterher.' },
  { label: 'Keine Daten-Weitergabe an Dritte.', detail: 'Keine Tracker, keine Analytics bei Start. Supabase in der EU.' },
];

export function AntiFeatures() {
  return (
    <section className="px-6 py-24" aria-labelledby="anti-features-heading">
      <div className="max-w-4xl mx-auto">
        <SectionHeading id="anti-features-heading" eyebrow="Was Ronki NICHT tut">
          Die ehrliche Liste.
        </SectionHeading>
        <ul className="flex flex-col gap-4 mt-8">
          {ITEMS.map((item) => (
            <li key={item.label} className="flex flex-col gap-1 border-l-2 border-plum/40 pl-4 py-2">
              <p className="font-display text-lg line-through decoration-plum/60 decoration-[1.5px]">{item.label}</p>
              <p className="text-sm opacity-75 leading-relaxed">{item.detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm opacity-75">
          Ausführliche Begründungen auf <Link to="/wie-es-funktioniert" className="underline">Wie es funktioniert</Link> und <Link to="/wissenschaft" className="underline">Wissenschaft</Link>.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/components/AntiFeatures.tsx
git commit -m "feat(website): anti-features section for homepage"
```

---

## Task 18: Assemble Home page

**Files:**
- Modify: `website/src/pages/Home.tsx`

- [ ] **Step 1: Compose the homepage**

Replace `website/src/pages/Home.tsx`:

```tsx
import { Hero } from '../components/Hero';
import { RealQuote } from '../components/RealQuote';
import { Pillars } from '../components/Pillars';
import { ArcStoryboard } from '../components/ArcStoryboard';
import { AntiFeatures } from '../components/AntiFeatures';
import { Footer } from '../components/Footer';
import { WaitlistCTA } from '../components/WaitlistCTA';
import { PageMeta } from '../components/PageMeta';
import { SectionHeading } from '../components/SectionHeading';
import { LAUNCH_STATE } from '../config/launch-state';

export default function Home() {
  return (
    <>
      <PageMeta
        title="Ronki — Der Drachen-Gefährte für Kinder-Routinen"
        description="Ronki trägt die Routine mit. Ein Drachen-Gefährte, der Kinder durch den Alltag begleitet — ohne Streaks, ohne Werbung, ohne Dark Patterns."
        canonicalPath="/"
      />
      <Hero />
      <RealQuote />
      <Pillars />
      <ArcStoryboard />
      <AntiFeatures />
      <ClosingCTA />
      <Footer />
    </>
  );
}

function ClosingCTA() {
  return (
    <section className="px-6 py-24 bg-moss/10" aria-labelledby="closing-cta-heading">
      <div className="max-w-3xl mx-auto text-center flex flex-col gap-8 items-center">
        <SectionHeading id="closing-cta-heading" eyebrow="Bald verfügbar">
          Trag dich ein — wir melden uns einmal.
        </SectionHeading>
        <div className="w-full max-w-md">
          <WaitlistCTA launchState={LAUNCH_STATE} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify in local preview**

```bash
npm run dev:web
```

Navigate to `/`. You should see: hero → real quote → pillars → arc storyboard → anti-features → closing CTA → footer. Scroll feels quiet, motion doesn't overwhelm, links work. Placeholder images may be broken — that's expected.

Stop the server.

- [ ] **Step 3: Commit**

```bash
git add website/src/pages/Home.tsx
git commit -m "feat(website): assemble homepage sections"
```

---

## Task 19: HowItWorks page — Arc Engine / Sanctuary / Micropedia sections

**Files:**
- Modify: `website/src/pages/HowItWorks.tsx`

- [ ] **Step 1: Build the three explainer sections inline**

Replace `website/src/pages/HowItWorks.tsx`:

```tsx
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { SectionHeading } from '../components/SectionHeading';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <>
      <PageMeta
        title="Wie Ronki arbeitet"
        description="Arc Engine, Sanctuary, Micropedia. Der Mechanismus hinter Ronki — transparent erklärt."
        canonicalPath="/wie-es-funktioniert"
      />
      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-20">
          <header className="flex flex-col gap-4">
            <h1 className="text-5xl font-display leading-tight">Wie Ronki arbeitet</h1>
            <p className="text-lg opacity-85 leading-relaxed">
              Ronki ist kein Habit-Tracker. Ronki ist ein <strong>narrativer Routine-Vermittler</strong> — ein Drache, der kleine Geschichten vorschlägt, die Kinder durch ihren Alltag tragen. Hier ist, wie das funktioniert.
            </p>
          </header>

          <section>
            <SectionHeading eyebrow="Kernmechanismus">Die Arc Engine.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>Ein <strong>Bogen</strong> ist eine kurze, mehrtägige Episode, die Ronki erzählt — aus drei Arten von Beats zusammengesetzt:</p>
              <ul className="flex flex-col gap-3 pl-5 list-disc">
                <li><strong>Routine-Beats.</strong> Bestehende Routinen (Zähneputzen, Anziehen), die Ronki narrativ aufnimmt. Das Kind macht, was es sowieso tut; die Geschichte schreitet still voran.</li>
                <li><strong>Bastel-Beats.</strong> Kleine DIY-Aufgaben aus Kinder-Interessen: Malen, Falten, Bauen. Vorlage drucken, machen, zeigen, „Ich hab's geschafft" tippen.</li>
                <li><strong>Lore-Beats.</strong> 2–4 Sätze Geschichte in einfacher Sprache — die Fäden des Bogens.</li>
              </ul>
              <p>
                Etwa 1–2 Bögen pro Woche, dazwischen ruht Ronki. Kein Bogen zur gleichen Zeit. Keine Hetze. Das Kind wählt, wann und ob.
              </p>
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Der Ort">Das Sanctuary.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Das Sanctuary ist Ronkis Zuhause — und die Erinnerungslandschaft des Kindes. Jeder fertige Bogen hinterlässt eine Spur: eine gemalte Karte an der Wand, ein kleines Wesen im Garten, ein Erinnerungsstück im Regal.
              </p>
              <p>
                Fortschritt ist <strong>räumlich</strong>, nicht zeitlich. Kein Streak kann reißen. Das Sanctuary wächst in dem Tempo, in dem das Kind es besucht.
              </p>
              <img
                src="/images/placeholder-sanctuary-accretion.webp"
                alt="Drei Snapshots des Sanctuary über Wochen: leer, beginnend, gefüllt mit Erinnerungen."
                className="w-full rounded-2xl shadow-sm my-4"
                loading="lazy"
                width={900}
                height={400}
              />
              <p>Eine Unterzone, die <strong>Hatching Chamber</strong>, hält Eier — die über Tage schlüpfen, nicht über Minuten. Anticipation statt Dopamin.</p>
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Die Sammlung">Die Micropedia.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Etwa 60 kleine Wesen warten darauf, entdeckt zu werden — über Wochen, nicht an einem Nachmittag. Ein Silhouetten-Katalog, der sich füllt, während das Kind seine Bögen lebt.
              </p>
              <img
                src="/images/placeholder-micropedia-grid.webp"
                alt="Ein Raster aus Kreatur-Silhouetten auf Pergament, einige davon bereits entdeckt und bemalt."
                className="w-full rounded-2xl shadow-sm my-4"
                loading="lazy"
                width={900}
                height={600}
              />
              <p>
                Unterteilt in fünf Kapitel — <em>Wald, Himmel, Wasser, Traum, Herd</em> — damit die Gesamtzahl sich erreichbar anfühlt. Jede Entdeckung trägt eine Erinnerungszeile: <em>„Gefunden im Wiesen-Abschnitt am dritten Tag des Karten-Abenteuers."</em>
              </p>
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Was Ronki NICHT tut">Die ehrliche Liste, ausführlich.</SectionHeading>
            <div className="flex flex-col gap-6 leading-relaxed">
              <AntiFeatureDetail
                label="Keine Streaks."
                detail="Streaks belohnen Angst, nicht Wachstum. Sie machen den Tag nach einer Auszeit schwerer statt leichter. Wir haben sie ersetzt durch die räumliche Kontinuität des Sanctuary."
              />
              <AntiFeatureDetail
                label="Keine variablen Belohnungen oder Loot-Boxen."
                detail="Das sind Glücksspiel-Mechaniken. Sie gehören nicht in Produkte für Kinder. Unsere Belohnungen sind vorhersehbar — wer einen Bogen abschließt, weiß, was kommt."
              />
              <AntiFeatureDetail
                label="Keine Push-Nachrichten."
                detail="Ronki wartet im Sanctuary. Er nervt nicht hinterher. Das Kind kommt, wenn es will. Das ist der Kernmechanismus — würden wir nachschieben, würden wir ihn brechen."
              />
              <AntiFeatureDetail
                label="Keine Werbung, keine Partner-Deals, keine In-App-Käufe bei Start."
                detail="Monetarisierung, wenn, dann transparent und Eltern-facing. Nie durch Kinderaufmerksamkeit."
              />
              <AntiFeatureDetail
                label="Keine Tracker, keine Analytics bei Start."
                detail="Wir erfahren nicht, wie lange dein Kind mit Ronki spielt. Das ist Absicht. Falls wir später Analytics brauchen, wird's Plausible oder ähnlich — und wir sagen's laut."
              />
              <p className="text-sm opacity-75">
                Warum? Siehe <Link to="/wissenschaft" className="underline">Wissenschaft</Link> — jede dieser Entscheidungen hat eine Quelle.
              </p>
            </div>
          </section>

          <Faq />
        </div>
      </main>
      <Footer />
    </>
  );
}

function AntiFeatureDetail({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex flex-col gap-2 border-l-2 border-plum/40 pl-4 py-1">
      <p className="font-display text-xl">{label}</p>
      <p className="opacity-85 leading-relaxed">{detail}</p>
    </div>
  );
}

const FAQS = [
  { q: 'Ab welchem Alter?', a: 'Ronki ist für Kinder zwischen 6 und 10 Jahren gebaut — das Alter, in dem selbstständige Routinen eingeübt werden, aber Begleitung noch den Unterschied macht.' },
  { q: 'Wie lange dauert eine Sitzung?', a: 'Routinen sind in wenigen Minuten abgeticket. Bastel-Beats laufen über den Tag. Ein ganzer Bogen spannt sich über mehrere Tage. Der App-Screen-Time selbst bleibt kurz (3–15 Min).' },
  { q: 'Was passiert bei Bildschirmzeit-Konflikten?', a: 'Ronki hat eine eingebaute Bildschirmzeit-Logik, die Pause-Phasen respektiert. Das Kind kann in Eile nicht „mehr Zeit" freischalten.' },
  { q: 'Funktioniert Ronki offline?', a: 'Ja. Ronki ist eine PWA — nach dem ersten Laden funktionieren alle Kern-Features ohne Netz.' },
  { q: 'Was kostet Ronki?', a: 'Aktuell kostenlos. Wenn sich das ändert, sagen wir's klar und früh — und jede Monetarisierung wird Eltern-facing sein, nie durch Kinderaufmerksamkeit.' },
];

function Faq() {
  return (
    <section>
      <SectionHeading eyebrow="Häufige Fragen">FAQ.</SectionHeading>
      <dl className="flex flex-col gap-6 mt-4">
        {FAQS.map(({ q, a }) => (
          <div key={q} className="flex flex-col gap-2">
            <dt className="font-display text-lg">{q}</dt>
            <dd className="opacity-85 leading-relaxed">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 2: Verify in local preview**

```bash
npm run dev:web
```

Navigate to `/wie-es-funktioniert`. All five sections render in order, FAQ shows, footer at the bottom. Check links back to home and to science.

Stop the server.

- [ ] **Step 3: Commit**

```bash
git add website/src/pages/HowItWorks.tsx
git commit -m "feat(website): HowItWorks page — arc engine, sanctuary, micropedia, anti-features, FAQ"
```

---

## Task 20: Science page

**Files:**
- Modify: `website/src/pages/Science.tsx`

- [ ] **Step 1: Implement Science page**

Replace `website/src/pages/Science.tsx`:

```tsx
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { SectionHeading } from '../components/SectionHeading';

type SourceLink = { label: string; href: string };

function SourceLinks({ links }: { links: SourceLink[] }) {
  return (
    <ul className="flex flex-col gap-2 mt-4 text-sm">
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} className="underline" target="_blank" rel="noreferrer noopener">
            {l.label} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Science() {
  return (
    <>
      <PageMeta
        title="Die Wissenschaft hinter Ronki"
        description="Ronki ist nach dem gebaut, was Kinderentwicklung wirklich braucht — AAP, UNICEF RITEC-8, D4CR, Self-Determination Theory."
        canonicalPath="/wissenschaft"
      />
      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-20">
          <header className="flex flex-col gap-4">
            <h1 className="text-5xl font-display leading-tight">Die Wissenschaft hinter Ronki</h1>
            <p className="text-lg opacity-85 leading-relaxed">
              Ronki ist nicht „gamifiziert". Ronki ist nach dem gebaut, was Kinderentwicklung wirklich braucht — und gegen das, was digitale Produkte für Kinder seit Jahren falsch machen.
            </p>
          </header>

          <section>
            <SectionHeading eyebrow="Theoretische Grundlage">Self-Determination Theory.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Deci & Ryan zeigen: Motivation hält, wenn drei Bedürfnisse erfüllt sind — <strong>Autonomie, Kompetenz, Zugehörigkeit</strong>. Ronki ist auf diesen drei Säulen gebaut:
              </p>
              <ul className="flex flex-col gap-2 pl-5 list-disc">
                <li><strong>Autonomie.</strong> Das Kind wählt Tempo und Bögen. Ronki bietet an — er befiehlt nicht.</li>
                <li><strong>Kompetenz.</strong> Routinen sind im Sweet Spot — machbar, nicht trivial. Jeder abgeschlossene Bogen hinterlässt etwas Sichtbares.</li>
                <li><strong>Zugehörigkeit.</strong> Die Beziehung Kind ↔ Drache ↔ Familie trägt die Routine — kein einsames Spiel.</li>
              </ul>
              <SourceLinks links={[
                { label: 'Deci & Ryan — Self-Determination Theory (selfdeterminationtheory.org)', href: 'https://selfdeterminationtheory.org' },
              ]} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Bildschirmzeit-Leitlinien">AAP 2026.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Die American Academy of Pediatrics aktualisiert ihre Leitlinien 2026 und betont <strong>async, nicht-abhängig-machendes Design</strong>, <strong>Eltern in der Schleife</strong>, und <strong>werbefreie</strong> Umgebungen. Ronki entspricht jedem dieser Prinzipien.
              </p>
              <SourceLinks links={[
                { label: 'AAP — Media and Children', href: 'https://www.aap.org/en/patient-care/media-and-children/' },
              ]} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Kinderrechte im Digitalen">UNICEF RITEC-8.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                UNICEFs RITEC-Projekt formuliert acht Grundsätze für kinderrechts-orientiertes Produktdesign. Ronki erfüllt alle acht explizit — am wichtigsten: <strong>Privatsphäre</strong>, <strong>Sicherheit</strong>, <strong>Autonomie</strong>, und <strong>Teilhabe</strong>.
              </p>
              <SourceLinks links={[
                { label: 'UNICEF RITEC — Responsible Innovation in Technology for Children', href: 'https://www.unicef.org/globalinsight/responsible-innovation-technology-children' },
              ]} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Design-Prinzipien">D4CR — Designing for Children's Rights.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Der D4CR-Verband verbindet Designer:innen, die sich verpflichten, Kinderrechte in jedem Produkt-Entscheid zu tragen. Ronki folgt den D4CR-Prinzipien bei Onboarding, Feedback-Mechanismen und Belohnungsstrukturen.
              </p>
              <SourceLinks links={[
                { label: 'Designing for Children\'s Rights Association', href: 'https://designingforchildrensrights.org' },
              ]} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Kultureller Kontext">Jonathan Haidt — The Anxious Generation.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>
                Haidts Kritik: Die Kombination aus sozialen Medien, unbegrenzter Bildschirmzeit und Engagement-Mechaniken hat eine Generation ängstlicher Kinder produziert. Ronki antwortet: <strong>async Tempo</strong>, <strong>kein Vergleichsdruck</strong>, <strong>keine sozialen Features</strong>, <strong>kein endloses Scrollen</strong>.
              </p>
              <SourceLinks links={[
                { label: 'The Anxious Generation (Offizielle Website)', href: 'https://www.anxiousgeneration.com' },
              ]} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Unsere expliziten Zusagen">Was wir zusichern — öffentlich.</SectionHeading>
            <div className="flex flex-col gap-4 leading-relaxed">
              <p>Wir bauen aktiv <strong>gegen</strong> Dark Patterns. Das heißt konkret:</p>
              <ul className="flex flex-col gap-2 pl-5 list-disc">
                <li>Keine variablen Belohnungen, keine Glücksspiel-Mechaniken.</li>
                <li>Keine Streaks, keine FOMO-Timer, keine „Letzte Chance"-Mechaniken.</li>
                <li>Keine Dark UX — kein Confirmshaming, keine versteckten Kosten, keine manipulativen Dialoge.</li>
                <li>Keine Werbe-Monetarisierung. Jemals.</li>
                <li>Keine Weitergabe von Kind-Daten an Dritte.</li>
              </ul>
              <blockquote className="mt-6 border-l-4 border-ochre pl-6 py-2 text-lg font-display italic">
                Wenn wir das brechen, dürft ihr uns daran erinnern — öffentlich.
              </blockquote>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify in local preview**

Navigate to `/wissenschaft`. Sections render, external links open in new tab, the pledge blockquote stands out visually.

- [ ] **Step 3: Commit**

```bash
git add website/src/pages/Science.tsx
git commit -m "feat(website): science page with research anchors and public pledge"
```

---

## Task 21: Impressum page

**Files:**
- Modify: `website/src/pages/Impressum.tsx`

- [ ] **Step 1: Implement Impressum**

Replace `website/src/pages/Impressum.tsx` (exact operator details must come from Marc — insert placeholders and flag):

```tsx
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';

export default function Impressum() {
  return (
    <>
      <PageMeta
        title="Impressum — Ronki"
        description="Impressum und rechtliche Angaben zu Ronki."
        canonicalPath="/impressum"
      />
      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <h1 className="text-4xl font-display">Impressum</h1>

          <section>
            <h2 className="text-xl font-display mb-2">Angaben gemäß § 5 TMG</h2>
            <address className="not-italic leading-relaxed">
              [Name]<br />
              [Straße und Hausnummer]<br />
              [PLZ Ort]<br />
              Deutschland
            </address>
          </section>

          <section>
            <h2 className="text-xl font-display mb-2">Kontakt</h2>
            <p>E-Mail: <a href="mailto:hallo@ronki.de" className="underline">hallo@ronki.de</a></p>
          </section>

          <section>
            <h2 className="text-xl font-display mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>[Name], [Anschrift wie oben]</p>
          </section>

          <section>
            <h2 className="text-xl font-display mb-2">EU-Streitschlichtung</h2>
            <p className="leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: {' '}
              <a href="https://ec.europa.eu/consumers/odr/" className="underline" target="_blank" rel="noreferrer noopener">
                https://ec.europa.eu/consumers/odr/
              </a>.
              Unsere E-Mail-Adresse findest du oben.
            </p>
            <p className="leading-relaxed mt-2">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display mb-2">Haftung für Inhalte</h2>
            <p className="leading-relaxed">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

> **BLOCKER:** Before launch, Marc must replace `[Name]`, `[Straße und Hausnummer]`, `[PLZ Ort]` with his actual operator details. Do not ship with placeholders in production.

- [ ] **Step 2: Commit**

```bash
git add website/src/pages/Impressum.tsx
git commit -m "feat(website): impressum page (operator details pending)"
```

---

## Task 22: Datenschutz page

**Files:**
- Modify: `website/src/pages/Datenschutz.tsx`

- [ ] **Step 1: Implement Datenschutz**

Replace `website/src/pages/Datenschutz.tsx`:

```tsx
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';

export default function Datenschutz() {
  return (
    <>
      <PageMeta
        title="Datenschutz — Ronki"
        description="Datenschutzerklärung zu Ronki — GDPR-konform, ohne Tracker."
        canonicalPath="/datenschutz"
      />
      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-8 leading-relaxed">
          <h1 className="text-4xl font-display">Datenschutzerklärung</h1>

          <section>
            <h2 className="text-2xl font-display mb-3">Kurzfassung</h2>
            <ul className="flex flex-col gap-2 pl-5 list-disc">
              <li>Wir setzen <strong>keine Tracking-Cookies</strong>. Auch keine funktionalen Analytics.</li>
              <li>Wir speichern <strong>nur eine E-Mail-Adresse</strong> — und nur, wenn du dich auf die Warteliste einträgst.</li>
              <li>Wir schicken <strong>genau eine E-Mail</strong> — am Start-Tag. Danach ist Schluss.</li>
              <li>Daten werden <strong>in der EU</strong> gespeichert (Supabase, EU-Region).</li>
              <li>Löschung jederzeit möglich — schreib an <a href="mailto:hallo@ronki.de" className="underline">hallo@ronki.de</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">1. Verantwortlich</h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist der im <a href="/impressum" className="underline">Impressum</a> genannte Betreiber.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">2. Welche Daten wir erheben</h2>
            <p className="mb-3">Wir erheben <strong>ausschließlich</strong> die E-Mail-Adresse, die du in das Warteliste-Formular einträgst — freiwillig.</p>
            <p>Darüber hinaus werden technisch erforderliche Server-Logs temporär geführt (Zugriffszeit, aufgerufene URL, HTTP-Status). Diese enthalten keine IP-Adressen in persistenter Form und werden nach 7 Tagen gelöscht.</p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">3. Wozu wir die E-Mail-Adresse nutzen</h2>
            <p>Wir nutzen deine E-Mail, um dich <strong>einmal</strong> zu informieren, wenn Ronki startet. Danach wird die Adresse:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc mt-2">
              <li><strong>innerhalb von 30 Tagen gelöscht</strong>, wenn du Ronki nicht nutzt, oder</li>
              <li>in deinen App-Account überführt, wenn du Ronki aktivierst (mit erneuter Einwilligung).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">4. Rechtsgrundlage</h2>
            <p>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Die Einwilligung ist jederzeit widerrufbar.</p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">5. Auftragsverarbeiter</h2>
            <p>
              Wir nutzen <strong>Supabase</strong> (Supabase Inc., EU-Region) zur Speicherung der Warteliste. Ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO liegt vor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">6. Deine Rechte</h2>
            <p className="mb-3">Du hast jederzeit das Recht auf:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc">
              <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerruf deiner Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
              <li>Beschwerde bei der zuständigen Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
            <p className="mt-3">Schreib einfach an <a href="mailto:hallo@ronki.de" className="underline">hallo@ronki.de</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">7. Cookies & Tracking</h2>
            <p>Diese Website setzt <strong>keine Tracking-Cookies</strong> und keine Drittanbieter-Analytics. Deshalb gibt es auch kein Cookie-Banner.</p>
            <p className="mt-2">Einzige Ausnahme: kurzfristige Session-Cookies für das Warteliste-Formular (Rate-Limiting). Diese werden beim Schließen des Browsers automatisch gelöscht.</p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-3">8. Änderungen</h2>
            <p>
              Wenn wir diese Erklärung ändern, sagen wir's hier und datieren die Änderung. Stand: 2026-04-15.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify in local preview**

Navigate through `/` → `/impressum` → `/datenschutz`. All links work, text renders clearly.

- [ ] **Step 3: Commit**

```bash
git add website/src/pages/Datenschutz.tsx
git commit -m "feat(website): datenschutz page (GDPR-compliant, cookie-free)"
```

---

## Task 23: Page-level integration tests

**Files:**
- Create: `website/tests/pages.test.tsx`

- [ ] **Step 1: Write page render tests**

`website/tests/pages.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../src/lib/supabase', () => ({
  supabase: { from: vi.fn(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) })) },
}));

import Home from '../src/pages/Home';
import HowItWorks from '../src/pages/HowItWorks';
import Science from '../src/pages/Science';
import Impressum from '../src/pages/Impressum';
import Datenschutz from '../src/pages/Datenschutz';

function renderIn(route: string, Component: React.ComponentType) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Component />
    </MemoryRouter>,
  );
}

describe('Pages render without throwing', () => {
  it('renders Home', () => {
    renderIn('/', Home);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/ronki trägt die routine/i);
  });

  it('renders HowItWorks', () => {
    renderIn('/wie-es-funktioniert', HowItWorks);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/wie ronki arbeitet/i);
  });

  it('renders Science with external source links', () => {
    renderIn('/wissenschaft', Science);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/wissenschaft/i);
    const aapLink = screen.getByRole('link', { name: /AAP/i });
    expect(aapLink).toHaveAttribute('target', '_blank');
    expect(aapLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders Impressum', () => {
    renderIn('/impressum', Impressum);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/impressum/i);
  });

  it('renders Datenschutz', () => {
    renderIn('/datenschutz', Datenschutz);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/datenschutz/i);
    expect(screen.getByText(/keine tracking-cookies/i)).toBeInTheDocument();
  });
});

describe('Semantic structure', () => {
  it('each page has exactly one h1', () => {
    for (const [Component, route] of [
      [Home, '/'],
      [HowItWorks, '/wie-es-funktioniert'],
      [Science, '/wissenschaft'],
      [Impressum, '/impressum'],
      [Datenschutz, '/datenschutz'],
    ] as const) {
      const { container, unmount } = render(
        <MemoryRouter initialEntries={[route]}>
          <Component />
        </MemoryRouter>,
      );
      const h1s = container.querySelectorAll('h1');
      expect(h1s.length, `${route} should have exactly one h1`).toBe(1);
      unmount();
    }
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:web
```

Expected: all tests pass, including new page tests.

- [ ] **Step 3: Commit**

```bash
git add website/tests/pages.test.tsx
git commit -m "test(website): page-level render and semantic structure tests"
```

---

## Task 24: Accessibility audit pass

**Files:**
- Modify: component files as needed based on audit findings

- [ ] **Step 1: Run axe in the browser**

Start the dev server:

```bash
npm run dev:web
```

Install the axe DevTools browser extension if not already installed. Open each page (`/`, `/wie-es-funktioniert`, `/wissenschaft`, `/impressum`, `/datenschutz`) and run an axe scan.

- [ ] **Step 2: Fix any violations**

For each violation, apply the standard fix:
- **Color contrast failures:** adjust the token values in `globals.css` until WCAG AA passes (4.5:1 for body text, 3:1 for large text ≥18pt/24px or bold ≥14pt/18.66px).
- **Missing alt text:** add or refine `alt` attributes on every `<img>`. Decorative images get `alt=""`; content images get descriptive text.
- **Missing form labels:** verify every `<input>` has an associated `<label>`.
- **Link text issues:** make sure every link's text makes sense out of context ("Wie Ronki arbeitet →" is fine; "hier klicken" is not).

Commit fixes as they're made: `fix(website a11y): <specific issue>`.

- [ ] **Step 3: Keyboard navigation smoke test**

Tab through each page with only the keyboard:
- All interactive elements reachable
- Focus visible on every focused element
- Tab order matches visual order
- Enter activates links and buttons
- No keyboard traps

If focus styles are missing/invisible, add a global rule in `globals.css`:

```css
:focus-visible {
  outline: 2px solid var(--color-ochre);
  outline-offset: 2px;
}
```

- [ ] **Step 4: prefers-reduced-motion verification**

In browser DevTools, emulate `prefers-reduced-motion: reduce`. Reload the homepage. Scroll through the arc storyboard. Verify beats appear without the scroll-linked parallax (the `useReducedMotion` hook should have already handled this — this is the verification).

- [ ] **Step 5: Commit**

```bash
git add website/
git commit -m "fix(website a11y): WCAG AA compliance across all pages"
```

---

## Task 25: SEO basics — sitemap, robots, OG image

**Files:**
- Create: `website/public/robots.txt`
- Create: `website/scripts/generate-sitemap.ts`
- Modify: `package.json` (add build hook)
- Modify: `website/index.html` (add OG image meta)

- [ ] **Step 1: Add robots.txt**

`website/public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://ronki.de/sitemap.xml
```

- [ ] **Step 2: Create sitemap generator script**

`website/scripts/generate-sitemap.ts`:

```ts
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
```

- [ ] **Step 3: Wire the sitemap into build**

Update `package.json`'s website scripts to generate the sitemap before build:

```json
"prebuild:web": "tsx website/scripts/generate-sitemap.ts",
"build:web": "vite build --config website/vite.config.ts",
```

Install `tsx` if not present:

```bash
npm install -D tsx
```

- [ ] **Step 4: Generate OG image**

Either (a) create a placeholder `website/public/og-image.png` (1200×630) with the tagline baked in, or (b) defer to asset task (27) and skip the actual file for now — just wire the meta tag.

Add to `website/index.html` `<head>`:

```html
<meta property="og:image" content="https://ronki.de/og-image.png" />
<meta property="og:url" content="https://ronki.de/" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 5: Run the sitemap generator manually to verify**

```bash
npx tsx website/scripts/generate-sitemap.ts
```

Expected: `website/public/sitemap.xml` exists and contains the five routes.

- [ ] **Step 6: Commit**

```bash
git add website/public/robots.txt website/public/sitemap.xml website/scripts/ website/index.html package.json package-lock.json
git commit -m "feat(website seo): sitemap, robots, OG meta tags"
```

---

## Task 26: Performance pass — font self-hosting, image optimization, Lighthouse

**Files:**
- Modify: `website/src/styles/globals.css`
- Create: `website/public/fonts/` (font files)
- Modify: `website/index.html` (preload hints)

- [ ] **Step 1: Identify fonts used by the app**

Check `~/louis-quest/src/index.css` and `~/louis-quest/src/App.css` for `@font-face` declarations or Google Fonts imports. Capture the font family names and file paths.

If the app self-hosts fonts in `~/louis-quest/public/fonts/`, those files should be copied (or symlinked) into `website/public/fonts/` so the website build can serve them.

- [ ] **Step 2: Add `@font-face` to globals.css**

Example (adjust to actual fonts):

```css
@font-face {
  font-family: 'Ronki Display';
  src: url('/fonts/ronki-display.woff2') format('woff2');
  font-weight: 400 700;
  font-display: swap;
}

@font-face {
  font-family: 'Ronki Body';
  src: url('/fonts/ronki-body.woff2') format('woff2');
  font-weight: 400 600;
  font-display: swap;
}
```

Update `@theme` tokens to reference these families:

```css
@theme {
  --font-display: 'Ronki Display', Georgia, serif;
  --font-body: 'Ronki Body', Georgia, serif;
}
```

- [ ] **Step 3: Preload critical fonts**

In `website/index.html` `<head>`:

```html
<link rel="preload" href="/fonts/ronki-display.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/ronki-body.woff2" as="font" type="font/woff2" crossorigin />
```

- [ ] **Step 4: Verify image optimization**

Every `<img>` should have:
- `loading="lazy"` except for the hero image (`loading="eager"`)
- Explicit `width` and `height` attributes (to prevent CLS)
- WebP or AVIF format for painterly illustrations (once real assets exist)

Scan `website/src/components/` and verify — fix anything missing.

- [ ] **Step 5: Build and run Lighthouse**

```bash
npm run build:web
npm run preview:web
```

In Chrome DevTools, run Lighthouse on `http://localhost:4173/` (or whatever port preview uses). Target scores:
- Performance ≥ 90 (relaxed from 95 because placeholder images may be unoptimized)
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

Record scores. If Performance is < 90, investigate largest offenders (usually unoptimized images or render-blocking resources).

- [ ] **Step 6: Commit**

```bash
git add website/
git commit -m "perf(website): self-host fonts, preload, image optimization"
```

---

## Task 27: Final asset swap + launch mechanics

**Files:**
- Replace: `website/public/images/placeholder-*.webp` → real painterly assets
- Create: `website/scripts/send-drop-day-email.ts`
- Modify: `website/src/config/launch-state.ts` (only at drop-day — this is a runtime decision, not a plan step)

- [ ] **Step 1: Replace placeholder images**

When painterly assets are ready (separate track, not this plan), replace each `placeholder-*.webp` in `website/public/images/` with the final illustration at the correct dimensions and format (WebP primary, AVIF secondary if the production pipeline supports it).

Update any `alt` text to reflect the actual illustration content.

- [ ] **Step 2: Write the drop-day email script**

`website/scripts/send-drop-day-email.ts`:

```ts
// Drop-day email script.
// Run manually on launch day after flipping LAUNCH_STATE to 'live' and deploying.
// Requires SUPABASE_SERVICE_ROLE_KEY and RESEND_API_KEY in env.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const resend = new Resend(process.env.RESEND_API_KEY!);

const SUBJECT = 'Ronki ist da.';
const BODY = `Hallo,

Ronki ist ab heute verfügbar. Du kannst ihn direkt im Browser ausprobieren — keine App Store nötig:

https://ronki.de

Das war die einzige E-Mail, die du von uns bekommst. Danke, dass du gewartet hast.

— Marc
`;

async function main() {
  const { data: subscribers, error } = await supabase
    .from('waitlist')
    .select('id, email')
    .is('notified_at', null);

  if (error) throw error;
  if (!subscribers || subscribers.length === 0) {
    console.log('No subscribers to notify.');
    return;
  }

  console.log(`Sending to ${subscribers.length} subscribers...`);

  for (const sub of subscribers) {
    try {
      await resend.emails.send({
        from: 'Ronki <hallo@ronki.de>',
        to: sub.email,
        subject: SUBJECT,
        text: BODY,
      });
      await supabase
        .from('waitlist')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', sub.id);
      console.log(`Sent to ${sub.email}`);
    } catch (err) {
      console.error(`Failed to send to ${sub.email}:`, err);
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Install required packages:

```bash
npm install -D resend
```

> **Note:** This script is run manually on drop day. Marc runs it after flipping `LAUNCH_STATE = 'live'` in `website/src/config/launch-state.ts` and deploying. The human-in-the-loop design is deliberate — launch-day sends are not automated.

- [ ] **Step 3: Verify launch-state switch end-to-end**

Manually flip `website/src/config/launch-state.ts`:

```ts
export const LAUNCH_STATE: LaunchState = 'live';
```

Start the dev server (`npm run dev:web`), navigate to `/`, verify:
- Hero CTA reads "Kostenlos testen" (instead of "Auf die Warteliste")
- CTA is a link to `/app` (or wherever the PWA entry is), not a form
- Footer micro-copy swaps to the browser-based message

Then flip back to `'waitlist'` for the final commit:

```ts
export const LAUNCH_STATE: LaunchState = 'waitlist';
```

- [ ] **Step 4: Commit**

```bash
git add website/public/images/ website/scripts/send-drop-day-email.ts package.json package-lock.json website/src/config/launch-state.ts
git commit -m "feat(website): final assets + drop-day email script"
```

---

## Task 28: Deployment configuration

**Files:**
- Create: deployment configuration (choice: Vercel / Netlify / Cloudflare Pages)

- [ ] **Step 1: Pick a host**

Three acceptable choices (user decides during implementation based on DACH performance benchmarks + pricing):
- **Vercel** — simplest, best DX, US-origin with EU CDN.
- **Netlify** — similar to Vercel.
- **Cloudflare Pages** — best DACH edge performance, cheapest, most EU-privacy-compatible.

Recommendation: **Cloudflare Pages** for alignment with privacy-first positioning and DACH performance.

- [ ] **Step 2: Configure the chosen host**

For Cloudflare Pages:

Create `website/wrangler.toml` (if using Cloudflare) or configure via the dashboard:
- **Build command:** `npm run build:web`
- **Build output directory:** `website/dist`
- **Root directory:** `/` (monorepo root — Cloudflare supports this)
- **Environment variables:**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Custom domain:** `ronki.de` (after DNS is pointed at Cloudflare Pages)

For Vercel/Netlify equivalents, translate the above into the respective `.vercel` or `netlify.toml` configuration.

- [ ] **Step 3: Set up redirects**

Because this is a client-rendered SPA with React Router, deep links need to fall back to `index.html`. Create `website/public/_redirects` (Netlify/Cloudflare Pages):

```
/* /index.html 200
```

Or for Vercel, create `website/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 4: Deploy a staging preview**

Via the chosen host's CLI or dashboard, deploy the current branch to a preview URL. Verify:
- All pages render
- Waitlist form submits successfully (check Supabase table for the insert)
- No console errors
- Lighthouse scores hold (or beat) the local preview numbers

- [ ] **Step 5: Point production domain**

Update DNS for `ronki.de` to point at the host. Verify HTTPS + HSTS.

- [ ] **Step 6: Commit**

```bash
git add website/wrangler.toml website/public/_redirects
git commit -m "chore(website deploy): cloudflare pages config with SPA fallback"
```

---

## Final verification checklist

Before declaring the site shippable:

- [ ] All tests pass: `npm run test:web`
- [ ] All five routes render in local preview
- [ ] Waitlist form submits against a real Supabase (not mocked) and row appears in the table
- [ ] Lighthouse scores meet targets
- [ ] axe DevTools shows zero violations on all pages
- [ ] Keyboard navigation works throughout
- [ ] `prefers-reduced-motion` is respected
- [ ] Impressum placeholders have been replaced with Marc's real operator details
- [ ] All images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Build succeeds: `npm run build:web`
- [ ] Deployed staging preview works end-to-end
- [ ] Production domain resolves with valid HTTPS

---

## Notes for the implementer

1. **Don't skip the TDD tasks.** The waitlist logic, launch state, and form behavior are the only places in this codebase where correctness matters more than appearance. Tests catch the regressions that kill launches.
2. **Use the local preview workflow.** Marc's stated preference (in memory) is to verify every visual change in the dev server at `localhost:5174` before committing. Don't deploy-to-verify.
3. **Placeholder images are fine until they aren't.** Don't block on asset production. Ship the structure first; swap assets in Task 27.
4. **Match the app's painterly aesthetic.** If the app has specific Tailwind tokens or CSS variables, prefer importing/mirroring those over inventing new ones.
5. **No scope creep.** The spec is explicit about what's out: no blog, no testimonials beyond Marc's, no analytics, no English at launch. Push back if asked to add these.
6. **The Impressum is a blocker.** Real operator details must be filled in before production deploy. This is a legal requirement in Germany.
