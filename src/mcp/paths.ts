/**
 * Locating the repository root at runtime.
 *
 * The MCP server returns the *real* source files of a component, so it needs
 * to resolve repository relative paths (as stored in the manifest) against the
 * checkout it runs from.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let cached: string | undefined;

/** Walk upwards until a directory containing `src/components` is found. */
export function resolveRepoRoot(): string {
  if (cached) return cached;
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 10; depth += 1) {
    if (existsSync(path.join(dir, 'src', 'components'))) {
      cached = dir;
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('unable to locate the repository root (no src/components directory found)');
}

/** Resolve a repository relative path to an absolute one. */
export function resolveFromRepo(relativePath: string): string {
  return path.join(resolveRepoRoot(), relativePath);
}
