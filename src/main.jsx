import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import '../styled-system/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Ronki/sw.js').catch(() => {});
  });
}
