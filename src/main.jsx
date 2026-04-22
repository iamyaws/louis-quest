import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import App from './App';
import './index.css';

// Legal pages are accessible pre-auth (important for parents to read
// Datenschutz/Nutzungsbedingungen BEFORE creating an account). They're
// therefore routed OUTSIDE the AuthProvider that App wraps.
const Impressum = lazy(() => import('./pages/Impressum'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const Nutzungsbedingungen = lazy(() => import('./pages/Nutzungsbedingungen'));

function LegalFallback() {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-surface">
      <p className="font-label text-sm text-on-surface-variant">Laden…</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <BrowserRouter>
      <Routes>
        <Route
          path="/impressum"
          element={
            <Suspense fallback={<LegalFallback />}>
              <Impressum />
            </Suspense>
          }
        />
        <Route
          path="/datenschutz"
          element={
            <Suspense fallback={<LegalFallback />}>
              <Datenschutz />
            </Suspense>
          }
        />
        <Route
          path="/nutzungsbedingungen"
          element={
            <Suspense fallback={<LegalFallback />}>
              <Nutzungsbedingungen />
            </Suspense>
          }
        />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </LanguageProvider>
);

// SW management: register once, detect updates, expose a readiness signal
// the UI can listen to. The previous implementation unregistered the SW and
// nuked all caches on every page load, which defeated the purpose of having a
// SW at all (no offline benefit, no precache savings) AND still left users on
// stale HTML because the current page already loaded before the nuke ran.
//
// New flow:
//   1. On load, register /sw.js.
//   2. When the browser detects a new SW version, it enters the "installing"
//      state. Once it reaches "installed" AND there's an active controller,
//      we have a waiting worker — a new version is ready.
//   3. We dispatch a 'sw:update-ready' window event (and set
//      window.__swWaiting to the waiting registration) so the update banner
//      can prompt the user to reload. The user triggers activation via a
//      postMessage({ type: 'SKIP_WAITING' }).
//   4. When the new SW takes control, we reload once so the user gets the
//      fresh HTML.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'sw.js')
      .then((registration) => {
        // If a waiting worker already exists on registration (user reopened
        // the tab after an update installed in the background), surface it
        // immediately.
        if (registration.waiting && navigator.serviceWorker.controller) {
          window.__swWaiting = registration.waiting;
          window.dispatchEvent(new CustomEvent('sw:update-ready'));
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (
              installing.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New SW waiting → tell the UI.
              window.__swWaiting = registration.waiting || installing;
              window.dispatchEvent(new CustomEvent('sw:update-ready'));
            }
          });
        });
      })
      .catch(() => {
        // Registration failures are non-fatal — the app works without a SW.
      });

    // When the controller changes (because a waiting SW called skipWaiting()
    // and claimed clients), reload once to pick up the new HTML + chunks.
    let reloadedForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadedForUpdate) return;
      reloadedForUpdate = true;
      window.location.reload();
    });
  });
}
