import React from 'react';
import ReactDOM from 'react-dom/client';
import { LanguageProvider } from './i18n/LanguageContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <App />
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
