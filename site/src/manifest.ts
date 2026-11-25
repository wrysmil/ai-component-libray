/**
 * The single manifest source of the showcase site.
 *
 * The site, the HTTP API and the MCP server all read the very same JSON file
 * (`src/manifest/manifest.json`) and validate it with the very same
 * `parseManifest()` implementation, so the three surfaces can never drift
 * apart.
 */

import rawManifest from '../../src/manifest/manifest.json';
import { parseManifest } from '../../src/core/manifest.js';
import { CATEGORIES } from '../../src/core/types.js';
import type { Category, Manifest, ManifestEntry } from '../../src/core/types.js';

/** The validated manifest document. */
export const manifest: Manifest = parseManifest(rawManifest);

/** Every component of the manifest, in manifest order. */
export const components: ManifestEntry[] = manifest.components;

/** The six closed categories of the library. */
export const categories: readonly Category[] = CATEGORIES;

/** Look up a single component by id. */
export function getComponent(id: string): ManifestEntry | undefined {
  return components.find((entry) => entry.id === id);
}

/** Every tag used by the manifest, sorted alphabetically and de-duplicated. */
export const tags: string[] = Array.from(
  new Set(components.flatMap((entry) => entry.tags)),
).sort((a, b) => a.localeCompare(b));

/** Human readable label of a category. */
export function categoryLabel(category: Category): string {
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
