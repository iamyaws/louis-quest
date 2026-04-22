import React, { useEffect, useState } from 'react';

/**
 * SWUpdateBanner — shown at the top of the app when a new service-worker
 * version is installed and waiting to take over. Non-blocking: the user can
 * keep playing on the current version, or tap "Neu laden" to activate the new
 * one (which triggers a single page reload).
 *
 * Wiring (done in src/main.jsx):
 *   - `window.__swWaiting` holds the waiting ServiceWorker registration
 *     reference once an update is ready.
 *   - A `sw:update-ready` CustomEvent fires on `window` at the same moment.
 *   - When the user clicks "Neu laden", we postMessage({ type: 'SKIP_WAITING' })
 *     to the waiting worker. Its `skipWaiting()` fires, it becomes the active
 *     SW, a `controllerchange` fires in main.jsx, and the page reloads once.
 *
 * Styling mirrors AlphaBanner so it sits visually in the same top-of-app
 * strip but with a brighter accent (amber) so parents/kids notice it.
 *
 * Not currently mounted — see audit notes. Mount under AlphaBanner in
 * App.jsx so both sticky strips stack cleanly.
 */
export default function SWUpdateBanner() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If an update was already detected before this component mounted
    // (e.g. detection happened while AuthGate was still loading), pick it
    // up from the window handle main.jsx sets.
    if (typeof window !== 'undefined' && window.__swWaiting) {
      setReady(true);
    }
    const onReady = () => setReady(true);
    window.addEventListener('sw:update-ready', onReady);
    return () => window.removeEventListener('sw:update-ready', onReady);
  }, []);

  if (!ready) return null;

  const handleReload = () => {
    const waiting = typeof window !== 'undefined' ? window.__swWaiting : null;
    if (waiting && typeof waiting.postMessage === 'function') {
      // Tell the waiting SW to activate now. main.jsx's controllerchange
      // listener will reload the page once the new SW takes over.
      waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback: plain reload. Users stuck in a weird state still recover.
      window.location.reload();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 inset-x-0 z-[61] bg-[#0F2C2E] text-white border-b border-[#FCD34D]/40"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-2 text-[12px] leading-tight">
        <span
          aria-hidden
          className="inline-block w-1.5 h-1.5 rounded-full bg-[#FCD34D] shrink-0 animate-pulse"
        />
        <span className="font-semibold tracking-wide">Neue Version verfügbar</span>
        <button
          type="button"
          onClick={handleReload}
          className="ml-auto shrink-0 rounded-full bg-[#FCD34D] text-[#0F2C2E] font-bold tracking-wide px-3 py-1 text-[11px] hover:brightness-110 transition"
        >
          Neu laden
        </button>
      </div>
    </div>
  );
}
