import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logClientError } from './utils/errorLogger';
import { initAnalytics } from './utils/analytics';

// MONITORING (2026-08 addition): React's ErrorBoundary only catches
// errors thrown during rendering. Real-world failures this project has
// actually hit — a blocked fetch() inside a click handler, a rejected
// Firestore write inside an async admin action — happen outside React's
// render cycle entirely and would otherwise never be recorded anywhere
// but the browser console the admin isn't watching. These two listeners
// catch everything else.
window.addEventListener('error', (event) => {
  logClientError(event.error || event.message, 'window-onerror');
});
window.addEventListener('unhandledrejection', (event) => {
  logClientError(event.reason, 'unhandled-promise-rejection');
});

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
