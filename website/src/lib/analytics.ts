/**
 * Thin wrapper around the Plausible Analytics global.
 *
 * Plausible loads asynchronously via a script tag in index.html, so
 * `window.plausible` may not exist yet on early calls. This helper
 * guards the call and silently no-ops if the global isn't ready or
 * the user has an extension blocking the script — analytics is
 * non-critical, it should never crash the app.
 *
 * Usage:
 *   import { trackEvent } from '../lib/analytics';
 *   trackEvent('Discord Click', { source: 'footer' });
 *   trackEvent('App Install Click');
 *
 * Conventions:
 * - Event names are Title Case (Plausible standard)
 * - Props are lowercase snake_case values
 * - Keep event names stable once introduced — renaming breaks the
 *   existing dashboard timeline in Plausible
 */

type PlausibleProps = Record<string, string | number | boolean>;

type PlausibleGlobal = (
  eventName: string,
  options?: { props?: PlausibleProps },
) => void;

declare global {
  interface Window {
    plausible?: PlausibleGlobal;
  }
}

export function trackEvent(name: string, props?: PlausibleProps): void {
  if (typeof window === 'undefined') return;
  const fn = window.plausible;
  if (typeof fn !== 'function') return;
  try {
    if (props) {
      fn(name, { props });
    } else {
      fn(name);
    }
  } catch {
    // Silently ignore — analytics must never crash the app.
  }
}
