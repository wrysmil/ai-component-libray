import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const siteRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(siteRoot, '..');

/**
 * Vite configuration of the showcase site.
 *
 * The site is a standalone Vite app whose root is `site/`, but it imports the
 * real component sources from `../src` — therefore the dev server has to be
 * allowed to serve files from the repository root.
 */
export default defineConfig({
  root: siteRoot,
  plugins: [react()],
  build: {
    outDir: path.resolve(siteRoot, 'dist'),
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
