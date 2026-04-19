/**
 * App mode — 'public' (simplified) or 'dev' (full features).
 *
 * Selection rules:
 *  1. ?mode=dev or ?mode=public URL param → writes to localStorage, sticks.
 *  2. localStorage key 'ronki_app_mode' → used if URL param absent.
 *  3. Default: 'public'
 *
 * `dev` mode shows: boss mechanic, XP/level bar, catEvo progress UI,
 * orbs, gear, equipped items, full Kodex page.
 * `public` mode hides those surfaces (state is preserved, just not rendered).
 */

const STORAGE_KEY = 'ronki_app_mode';
export type AppMode = 'public' | 'dev';

let cachedMode: AppMode | null = null;

function readModeFromUrl(): AppMode | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('mode');
  if (raw === 'dev' || raw === 'public') return raw;
  return null;
}

function readModeFromStorage(): AppMode | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'dev' || raw === 'public') return raw;
  } catch { /* ignore */ }
  return null;
}

/** Resolve the current app mode. Memoized after first read per page load. */
export function getMode(): AppMode {
  if (cachedMode) return cachedMode;
  // URL param wins + persists to localStorage
  const fromUrl = readModeFromUrl();
  if (fromUrl) {
    try { localStorage.setItem(STORAGE_KEY, fromUrl); } catch { /* ignore */ }
    cachedMode = fromUrl;
    return fromUrl;
  }
  const fromStorage = readModeFromStorage();
  cachedMode = fromStorage || 'public';
  return cachedMode;
}

export function isDevMode(): boolean {
  return getMode() === 'dev';
}

export function isPublicMode(): boolean {
  return getMode() === 'public';
}
