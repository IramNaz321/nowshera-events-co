// Safeguard against third-party scripts attempting to set read-only window.fetch
try {
  if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch.bind(window);
    let currentFetch = originalFetch;
    Object.defineProperty(window, 'fetch', {
      get: () => currentFetch,
      set: (fn) => { currentFetch = fn; },
      configurable: true,
      enumerable: true,
    });
  }
} catch {
  // Ignore if already configured
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
