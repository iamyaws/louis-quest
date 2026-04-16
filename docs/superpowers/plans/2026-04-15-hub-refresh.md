# Hub Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the Hub (Lagerfeuer) view with a time-of-day sky background, a compact Leitstern + Weather widget row, cup-shaped water tracker, and removal of the orphaned Epic Missions card.

**Architecture:** Four independent visual/UX changes to `Hub.jsx`, a geolocation upgrade to `useWeather.ts`, two i18n additions, and a dead-code removal pass on `App.jsx`. No new components needed. No state changes.

**Tech Stack:** React 18, JSX, Tailwind v4, Material Symbols Outlined icons, Open-Meteo API, browser Geolocation API, Vitest

---

## File Map

| File | Change |
|------|--------|
| `src/components/Hub.jsx` | Sky bg, widget row (replaces Kodex card + removes Missions card), water cups |
| `src/hooks/useWeather.ts` | Add geolocation; replace hardcoded Berlin coords |
| `src/i18n/de.json` | Add `hub.leitstern.title` |
| `src/i18n/en.json` | Add `hub.leitstern.title` |
| `src/App.jsx` | Remove `EpicMissions` import and `view === 'missions'` branch |

---

## Context You Need

**Project root:** `~/louis-quest`  
**Run tests:** `cd ~/louis-quest && npm test -- --run`  
**Dev server:** `npm run dev` (already running on port 5173 typically)  
**Art base:** all art is referenced as `` `${base}art/...` `` where `const base = import.meta.env.BASE_URL;` (already in Hub.jsx line 51)  
**i18n:** `const { t, lang } = useTranslation();` — `t('key')` interpolates `{count}` etc.  
**Weather hook:** `import useWeather, { getWeatherInfo } from '../hooks/useWeather';` — already imported in Hub.jsx line 5. `getWeatherInfo(code)` returns `{ emoji: string, label: string }`.

**Sky image filenames** (in `public/art/background/`):
```
dawn (6–9):   art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_an_early_morning_sky._S_882cfbe3-5eac-4403-87a0-5c66602cf76b_2.webp
midday (10–16): art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_bright_midday_sky._Wa_e8eca682-4eb9-4da2-8c93-a4cb25ba363d_1.webp
golden (17–19): art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_golden_hour_sky._Rich_a1deb403-56d2-4c34-9775-f174de32afb4_1.webp
night (20–5):   art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_deep_night_sky._Rich__c902cc19-afa0-4c99-a434-6e206610ddf9_0.webp
```

**Hub.jsx landmarks:**
- Line 86: Hub main div (`bg-surface` — remove this class)
- Lines 347–375: Water tracker circles
- Lines 723–755: Epic Missions Hub card (entire block to delete)
- Lines 788–806: Helden-Kodex card (replace with widget row)

**App.jsx landmarks:**
- Line 17: `import EpicMissions from './components/EpicMissions';`
- Line 87: `{view === 'missions' && <EpicMissions />}`

---

## Task 1: Time-of-Day Sky Background

**Files:**
- Modify: `src/components/Hub.jsx` (line 86 and top of return)

### Steps

- [ ] **Step 1: Add SKY_IMAGES constant and skyFile helper just above the Hub return statement**

In `src/components/Hub.jsx`, find the line `if (!state) return null;` (around line 77) and add this constant block immediately after it:

```jsx
// ── Time-of-day sky ──
const SKY_IMAGES = {
  dawn:   'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_an_early_morning_sky._S_882cfbe3-5eac-4403-87a0-5c66602cf76b_2.webp',
  midday: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_bright_midday_sky._Wa_e8eca682-4eb9-4da2-8c93-a4cb25ba363d_1.webp',
  golden: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_golden_hour_sky._Rich_a1deb403-56d2-4c34-9775-f174de32afb4_1.webp',
  night:  'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_deep_night_sky._Rich__c902cc19-afa0-4c99-a434-6e206610ddf9_0.webp',
};
const _h = new Date().getHours();
const skyFile = SKY_IMAGES[
  _h >= 6 && _h < 10  ? 'dawn'   :
  _h >= 10 && _h < 17 ? 'midday' :
  _h >= 17 && _h < 20 ? 'golden' :
  'night'
];
```

- [ ] **Step 2: Remove `bg-surface` from the Hub main div and add sky atmosphere divs**

Find this line (around line 86):
```jsx
<div className="relative min-h-dvh bg-surface pb-32">
```

Replace with:
```jsx
<div className="relative min-h-dvh pb-32">
  {/* ── Time-of-day sky atmosphere ── */}
  <div
    aria-hidden="true"
    style={{
      position: 'fixed', inset: 0, zIndex: 0,
      backgroundImage: `url(${base}${skyFile})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      opacity: 0.22,
      pointerEvents: 'none',
    }}
  />
  <div
    aria-hidden="true"
    style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: 'rgba(255,248,242,0.74)',
      pointerEvents: 'none',
    }}
  />
```

- [ ] **Step 3: Visual verification**

Open the app in browser. The Hub background should have a subtle tinted atmosphere (golden warmth in evening, cool blue at night, etc.). Cards should remain fully readable. The campfire scene should sit naturally within the tinted background.

To quickly test all four variants, temporarily force a sky key: replace `'night'` at the end of the ternary with `'dawn'`, `'midday'`, or `'golden'` to verify each looks good, then restore the time-based logic.

- [ ] **Step 4: Commit**

```bash
cd ~/louis-quest
git add src/components/Hub.jsx
git commit -m "feat(hub): time-of-day painted sky background atmosphere"
```

---

## Task 2: Leitstern + Weather Widget Row

**Files:**
- Modify: `src/components/Hub.jsx` (lines 788–806: replace Kodex card)
- Modify: `src/i18n/de.json`
- Modify: `src/i18n/en.json`

### Steps

- [ ] **Step 1: Add i18n keys**

In `src/i18n/de.json`, find `"hub.kodex.title": "Helden-Kodex"` and add immediately after:
```json
"hub.leitstern.title": "Leitstern",
"hub.weather.loading": "…",
```

In `src/i18n/en.json`, find `"hub.kodex.title": "Hero Codex"` and add immediately after:
```json
"hub.leitstern.title": "Guiding Star",
"hub.weather.loading": "…",
```

- [ ] **Step 2: Replace the Helden-Kodex card with the widget row**

Find the entire Helden-Kodex card block in `src/components/Hub.jsx` (lines 788–806):

```jsx
        {/* ── Helden-Kodex Card — Morgenwald ── */}
        <button
          className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98] relative overflow-hidden"
          style={{ background: '#fef9c3', border: '1.5px solid rgba(101,163,13,0.15)', boxShadow: '0 4px 16px rgba(101,163,13,0.08)' }}
          onClick={() => onNavigate?.('kodex')}
        >
          <img src={base + 'art/tex-morgenwald.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(254,249,195,0.55), rgba(236,252,203,0.5))' }} />
          <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg, #65a30d, #84cc16)', boxShadow: '0 2px 8px rgba(101,163,13,0.3)' }}>
            <span className="material-symbols-outlined text-white text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <div className="relative z-10 flex-1">
            <p className="font-headline font-bold text-lg" style={{ color: '#1a2e05' }}>{t('hub.kodex.title')}</p>
            <p className="font-body text-base" style={{ color: '#365314' }}>{t('hub.kodex.subtitle')}</p>
          </div>
          <span className="relative z-10 material-symbols-outlined text-2xl" style={{ color: '#4d7c0f' }}>chevron_right</span>
        </button>
```

Replace with this widget row:

```jsx
        {/* ── Widget Row: Leitstern + Weather ── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Leitstern widget */}
          <button
            className="p-4 rounded-2xl flex flex-col gap-3 text-left transition-all active:scale-[0.97] relative overflow-hidden"
            style={{
              background: '#fef9c3',
              border: '1.5px solid rgba(101,163,13,0.15)',
              boxShadow: '0 2px 10px rgba(101,163,13,0.08)',
              minHeight: 96,
            }}
            onClick={() => onNavigate?.('kodex')}
          >
            <img src={base + 'art/tex-morgenwald.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: 'linear-gradient(135deg, rgba(254,249,195,0.6), rgba(236,252,203,0.5))' }} />
            <div className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #65a30d, #84cc16)', boxShadow: '0 2px 6px rgba(101,163,13,0.3)' }}>
              <span className="material-symbols-outlined text-white text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <p className="relative z-10 font-headline font-bold text-base leading-tight"
               style={{ color: '#1a2e05' }}>{t('hub.leitstern.title')}</p>
          </button>

          {/* Weather widget */}
          <div
            className="p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(224,242,254,0.9), rgba(186,230,253,0.7))',
              border: '1.5px solid rgba(14,165,233,0.18)',
              boxShadow: '0 2px 10px rgba(14,165,233,0.08)',
              minHeight: 96,
            }}
          >
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.35) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              {weather ? (
                <>
                  <p className="text-3xl leading-none select-none">
                    {getWeatherInfo(weather.current.weatherCode).emoji}
                  </p>
                  <p className="font-headline font-extrabold text-2xl leading-none mt-1"
                     style={{ color: '#0c4a6e' }}>
                    {weather.current.temp}°
                  </p>
                  <p className="font-label text-xs mt-1 leading-tight"
                     style={{ color: '#0369a1' }}>
                    {getWeatherInfo(weather.current.weatherCode).label}
                  </p>
                </>
              ) : (
                <p className="font-label text-sm" style={{ color: '#0369a1' }}>
                  {t('hub.weather.loading')}
                </p>
              )}
            </div>
          </div>

        </div>
```

- [ ] **Step 3: Visual verification**

Open the Hub. Two equal-width widgets should appear where the large Kodex card was:
- Left: pale yellow/green Leitstern with star icon, tapping navigates to the Kodex view
- Right: sky-blue weather widget with emoji, temperature, and condition label (no city)

If weather shows "…" for more than a few seconds, check browser console for network errors from Open-Meteo.

- [ ] **Step 4: Commit**

```bash
cd ~/louis-quest
git add src/components/Hub.jsx src/i18n/de.json src/i18n/en.json
git commit -m "feat(hub): Leitstern + Weather widget row, replace large Kodex card"
```

---

## Task 3: Water Tracker Cup Icons

**Files:**
- Modify: `src/components/Hub.jsx` (lines 353–367: the six circle buttons)

### Steps

- [ ] **Step 1: Replace circle buttons with cup-shaped buttons**

Find the water tracker button block (lines 353–367 approximately):

```jsx
              <div className="flex justify-center gap-4">
                {[0,1,2,3,4,5].map(i => {
                  const filled = i < (state.dailyWaterCount || 0);
                  const isNext = i === (state.dailyWaterCount || 0);
                  return (
                    <button key={i}
                      className={`w-12 h-12 rounded-full border-[2.5px] transition-all flex items-center justify-center ${filled ? 'bg-primary border-primary' : isNext ? 'border-primary animate-pulse' : 'border-primary/15'}`}
                      style={{ background: filled ? undefined : isNext ? 'rgba(18,67,70,0.08)' : 'rgba(18,67,70,0.03)', boxShadow: isNext ? '0 0 0 4px rgba(18,67,70,0.06)' : 'none' }}
                      onClick={() => isNext && actions.drinkWater?.()}
                    >
                      {filled && <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                      {isNext && <span className="material-symbols-outlined text-primary text-lg">add</span>}
                    </button>
                  );
                })}
              </div>
```

Replace with:

```jsx
              <div className="flex justify-center gap-3">
                {[0,1,2,3,4,5].map(i => {
                  const filled = i < (state.dailyWaterCount || 0);
                  const isNext = i === (state.dailyWaterCount || 0);
                  return (
                    <button
                      key={i}
                      className="w-11 h-11 rounded-2xl border-[2px] transition-all flex items-center justify-center"
                      style={{
                        border: filled
                          ? '2px solid #124346'
                          : isNext
                          ? '2px solid #124346'
                          : '2px solid rgba(18,67,70,0.15)',
                        background: filled
                          ? 'linear-gradient(160deg, #124346 0%, #1d5c60 100%)'
                          : isNext
                          ? 'rgba(18,67,70,0.07)'
                          : 'rgba(18,67,70,0.02)',
                        boxShadow: filled
                          ? '0 2px 8px rgba(18,67,70,0.22)'
                          : isNext
                          ? '0 0 0 3px rgba(18,67,70,0.07)'
                          : 'none',
                        animation: isNext ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : 'none',
                      }}
                      onClick={() => isNext && actions.drinkWater?.()}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 20,
                          color: filled ? '#ffffff' : isNext ? '#124346' : 'rgba(18,67,70,0.22)',
                          fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
                        }}
                      >local_drink</span>
                    </button>
                  );
                })}
              </div>
```

- [ ] **Step 2: Visual verification**

Open the Daily Check-in section. Six cup/glass icons should appear:
- Filled cups (up to current count): teal gradient background, white filled cup icon
- Next cup: subtle teal border with pulsing, unfilled cup outline
- Empty cups: barely visible outline, faint cup icon

Tap the next cup — it should fill (teal gradient appears, icon fills) and the count in the header summary should update.

- [ ] **Step 3: Commit**

```bash
cd ~/louis-quest
git add src/components/Hub.jsx
git commit -m "feat(hub): water tracker cup icons replace abstract circles"
```

---

## Task 4: Retire Epic Missions

**Files:**
- Modify: `src/components/Hub.jsx` (lines 723–755: delete entire block)
- Modify: `src/App.jsx` (lines 17 and 87: remove import and view)

### Steps

- [ ] **Step 1: Remove the Epic Missions Hub card**

In `src/components/Hub.jsx`, find and delete the entire block from the comment through the closing brace. The block starts with:
```jsx
        {/* ── Epic Missions Entry — Kristallgold ── */}
        {(() => {
          const hasActive = (state.activeMissions || []).length > 0;
          return (
            <button
              className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98] relative overflow-hidden"
              style={{ background: '#451a03', border: '1.5px solid rgba(252,211,77,0.2)', boxShadow: '0 4px 20px rgba(69,26,3,0.25)' }}
              onClick={() => onNavigate?.('missions')}
            >
```

And ends with:
```jsx
          );
        })()}
```

Delete this entire block (approximately lines 723–755 inclusive, including the comment line).

- [ ] **Step 2: Remove EpicMissions import and view from App.jsx**

In `src/App.jsx` line 17, delete:
```jsx
import EpicMissions from './components/EpicMissions';
```

In `src/App.jsx` line 87, delete:
```jsx
        {view === 'missions' && <EpicMissions />}
```

- [ ] **Step 3: Verify no references remain**

```bash
cd ~/louis-quest
grep -rn "missions\|EpicMissions" src/components/Hub.jsx src/App.jsx
```

Expected output: zero matches. (Other files like EpicMissions.jsx itself are kept as data archive — do not delete them.)

- [ ] **Step 4: Run tests to ensure nothing broke**

```bash
cd ~/louis-quest && npm test -- --run
```

Expected: all tests pass (this change removes dead UI code with no logic dependencies).

- [ ] **Step 5: Commit**

```bash
cd ~/louis-quest
git add src/components/Hub.jsx src/App.jsx
git commit -m "feat(hub): retire Epic Missions card and view, Arc Engine replaces it"
```

---

## Task 5: Geolocation in useWeather

**Files:**
- Modify: `src/hooks/useWeather.ts`

### Steps

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useWeather.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getWeatherInfo } from './useWeather';

describe('getWeatherInfo', () => {
  it('returns sunny for code 0', () => {
    const { emoji, label } = getWeatherInfo(0);
    expect(emoji).toBe('☀️');
    expect(label).toBe('Sonnig');
  });

  it('returns rain emoji for code 61', () => {
    const { emoji } = getWeatherInfo(61);
    expect(emoji).toBe('🌧️');
  });

  it('returns thunderstorm for code 95', () => {
    const { emoji } = getWeatherInfo(95);
    expect(emoji).toBe('⛈️');
  });

  it('returns cloudy fallback for unknown code 999', () => {
    const { emoji } = getWeatherInfo(999);
    expect(emoji).toBe('☁️');
  });
});
```

- [ ] **Step 2: Run tests to verify they pass (they test existing logic)**

```bash
cd ~/louis-quest && npm test -- --run src/hooks/useWeather.test.ts
```

Expected: 4 tests pass (the `getWeatherInfo` function already exists).

- [ ] **Step 3: Update useWeather.ts to use geolocation**

Replace the entire `useWeather.ts` with:

```typescript
import { useState, useEffect } from 'react';

// Default: geographic center of Germany (fallback when geolocation denied)
const DEFAULT_LAT = 51.165;
const DEFAULT_LON = 10.451;

function buildApiUrl(lat: number, lon: number): string {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=auto&forecast_days=3`;
}

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
  };
  daily: {
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    precipProb: number;
  }[];
  fetchedAt: number;
}

const CACHE_KEY = 'hdx_weather';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function parseWeatherResponse(data: Record<string, unknown>): WeatherData {
  const current = data.current as Record<string, number>;
  const daily = data.daily as Record<string, unknown[]>;
  return {
    current: {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      weatherCode: current.weathercode,
      windSpeed: Math.round(current.windspeed_10m),
      humidity: current.relative_humidity_2m,
    },
    daily: (daily.time as string[]).map((d, i) => ({
      date: d,
      tempMax: Math.round((daily.temperature_2m_max as number[])[i]),
      tempMin: Math.round((daily.temperature_2m_min as number[])[i]),
      weatherCode: (daily.weathercode as number[])[i],
      precipProb: (daily.precipitation_probability_max as number[])[i],
    })),
    fetchedAt: Date.now(),
  };
}

export default function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Serve from cache if fresh
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as WeatherData;
        if (Date.now() - parsed.fetchedAt < CACHE_TTL) {
          setWeather(parsed);
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore parse errors */ }

    const fetchWeather = (lat: number, lon: number) => {
      fetch(buildApiUrl(lat, lon))
        .then(r => r.json())
        .then((data: Record<string, unknown>) => {
          const result = parseWeatherResponse(data);
          setWeather(result);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(result)); } catch { /* storage full */ }
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(DEFAULT_LAT, DEFAULT_LON), // denied or unavailable
        { timeout: 5000 },
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    }
  }, []);

  return { weather, loading, error };
}

// ── Weather code → emoji + label ──────────────────────────────────────────────
export function getWeatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0)   return { emoji: '☀️',  label: 'Sonnig' };
  if (code <= 3)    return { emoji: '⛅',  label: 'Bewölkt' };
  if (code <= 48)   return { emoji: '🌫️',  label: 'Nebel' };
  if (code <= 57)   return { emoji: '🌧️',  label: 'Nieselregen' };
  if (code <= 67)   return { emoji: '🌧️',  label: 'Regen' };
  if (code <= 77)   return { emoji: '🌨️',  label: 'Schnee' };
  if (code <= 82)   return { emoji: '🌦️',  label: 'Regenschauer' };
  if (code <= 86)   return { emoji: '🌨️',  label: 'Schneeschauer' };
  if (code <= 99)   return { emoji: '⛈️',  label: 'Gewitter' };
  return { emoji: '☁️', label: 'Bewölkt' };
}

// ── Clothing recommendations ──────────────────────────────────────────────────
export interface ClothingItem {
  emoji: string;
  name: string;
  reason: string;
}

export function getClothingRecs(
  temp: number,
  feelsLike: number,
  weatherCode: number,
  windSpeed: number,
): ClothingItem[] {
  const items: ClothingItem[] = [];
  const effective = feelsLike;
  const isRain = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82) || weatherCode >= 95;
  const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
  const isWindy = windSpeed >= 25;

  if (effective < 0) {
    items.push({ emoji: '🧥', name: 'Winterjacke',   reason: 'Es ist eiskalt!' });
    items.push({ emoji: '🧣', name: 'Schal',          reason: 'Hals warm halten' });
    items.push({ emoji: '🧤', name: 'Handschuhe',     reason: 'Finger schützen' });
    items.push({ emoji: '🧢', name: 'Mütze',          reason: 'Kopf warm halten' });
    items.push({ emoji: '👖', name: 'Dicke Hose',     reason: 'Beine warmhalten' });
    items.push({ emoji: '🥾', name: 'Winterstiefel',  reason: 'Füße warmhalten' });
  } else if (effective < 10) {
    items.push({ emoji: '🧥', name: 'Jacke',          reason: 'Es ist kalt' });
    items.push({ emoji: '🧥', name: 'Langer Pulli',   reason: 'Extra Wärme' });
    items.push({ emoji: '👖', name: 'Lange Hose',     reason: 'Beine warmhalten' });
  } else if (effective < 18) {
    items.push({ emoji: '🧥', name: 'Leichte Jacke',  reason: 'Für morgens/abends' });
    items.push({ emoji: '🧥', name: 'Pulli/Hoodie',   reason: 'Kann kühl werden' });
    items.push({ emoji: '👖', name: 'Lange Hose',     reason: 'Angenehm warm' });
  } else if (effective < 25) {
    items.push({ emoji: '👕', name: 'T-Shirt',        reason: 'Schönes Wetter!' });
    items.push({ emoji: '🩳', name: 'Kurze/Lange Hose', reason: 'Wie du magst' });
    items.push({ emoji: '👟', name: 'Sneaker',        reason: 'Bequem unterwegs' });
  } else {
    items.push({ emoji: '👕', name: 'T-Shirt',        reason: 'Es ist heiß!' });
    items.push({ emoji: '🩳', name: 'Kurze Hose',     reason: 'Bleib kühl' });
    items.push({ emoji: '🕶️', name: 'Sonnenbrille',   reason: 'Augen schützen' });
    items.push({ emoji: '🧢', name: 'Kappe/Hut',      reason: 'Sonnenschutz' });
  }

  if (temp >= 20 && weatherCode <= 3) {
    items.push({ emoji: '☀️', name: 'Sonnencreme',    reason: 'UV-Schutz!' });
  }
  if (isRain) {
    items.push({ emoji: '🌧️', name: 'Regenjacke',    reason: 'Es regnet!' });
    items.push({ emoji: '☂️', name: 'Regenschirm',   reason: 'Trocken bleiben' });
  }
  if (isSnow && effective >= 0) {
    items.push({ emoji: '🥾', name: 'Winterstiefel', reason: 'Rutschfest bleiben' });
  }
  if (isWindy && effective >= 10) {
    items.push({ emoji: '💨', name: 'Windbreaker',   reason: 'Starker Wind!' });
  }

  return items;
}
```

- [ ] **Step 4: Run all tests**

```bash
cd ~/louis-quest && npm test -- --run
```

Expected: all existing tests pass plus the 4 new `getWeatherInfo` tests.

- [ ] **Step 5: Visual verification**

Open the Hub. The weather widget should show actual weather data. If you're on a device with geolocation, the browser will prompt for location permission — grant it and the widget should reflect local weather, not Berlin. If denied, it shows Germany-centre weather (reasonable fallback).

- [ ] **Step 6: Commit**

```bash
cd ~/louis-quest
git add src/hooks/useWeather.ts src/hooks/useWeather.test.ts
git commit -m "feat(weather): geolocation-based coords, fallback to DE centre, add tests"
```

---

## Self-Review

**Spec coverage:**
- ✅ Time-of-day sky background → Task 1
- ✅ Leitstern widget (compact, no subtitle) → Task 2
- ✅ Weather widget (emoji + temp, no city) → Task 2
- ✅ Weather geolocation → Task 5
- ✅ Water tracker cups → Task 3
- ✅ Retire Epic Missions (Hub card + App.jsx routing) → Task 4
- ✅ i18n keys for Leitstern → Task 2 Step 1

**No placeholders:** All steps contain actual code. No "TBD" or "handle edge cases" language.

**Type consistency:** `WeatherData`, `getWeatherInfo`, `ClothingItem`, `getClothingRecs` — all defined in Task 5 and match the existing usage in Hub.jsx (imported via `import useWeather, { getWeatherInfo } from '../hooks/useWeather'`).
