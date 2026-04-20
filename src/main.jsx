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

// SW management: nuke old caches, force latest version
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // Clear ALL caches to bust stale content
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    // Unregister any existing SW, then re-register fresh
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      await reg.unregister();
    }
    // Re-register the latest SW
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {});
  });
}
