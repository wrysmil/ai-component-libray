/**
 * Browser entry point of the showcase site.
 *
 * The router is created here (and not inside `App.tsx`) so that the very same
 * `App` component can be rendered by the prerender script with a
 * `StaticRouter`.
 *
 * Note: the prerendered markup of `dist/index.html` is intentionally
 * *replaced* instead of hydrated (`createRoot` instead of `hydrateRoot`).
 * This is a deliberate simplification of the MVP — the prerendered HTML is
 * there for crawlers and for a fast first paint, the client application then
 * takes over.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App.js';
import './styles/site.css';

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}
