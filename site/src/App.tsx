/**
 * The route table of the showcase site.
 *
 * `App` deliberately does **not** create a router: the router is created by
 * `main.tsx` (BrowserRouter) and by `scripts/prerender.tsx` (StaticRouter), so
 * that the exact same component tree can be rendered on the server.
 */

import { Route, Routes } from 'react-router-dom';

import { CatalogPage } from './components/CatalogPage.js';
import { ComponentPage } from './components/ComponentPage.js';
import { Layout } from './components/Layout.js';
import { NotFoundPage } from './components/NotFoundPage.js';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/components/:id" element={<ComponentPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
