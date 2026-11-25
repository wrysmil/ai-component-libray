/**
 * Node side loader for the generated manifest.
 *
 * The showcase site reads the very same JSON file directly (it is bundled by
 * Vite), so all three consumers share one single data source.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { parseManifest } from '../core/manifest.js';
import type { Manifest } from '../core/types.js';

/** Absolute path of the generated manifest file. */
export const manifestPath = fileURLToPath(new URL('./manifest.json', import.meta.url));

/** Read + validate the manifest from disk. */
export function loadManifest(file: string = manifestPath): Manifest {
  const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
  return parseManifest(raw);
}

/** The manifest of this repository. */
export const manifest: Manifest = loadManifest();

/** Convenience accessor for the component entries. */
export const components = manifest.components;
