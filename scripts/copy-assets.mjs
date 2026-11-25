/**
 * Copy the component stylesheets into the build output.
 *
 * `tsc` only emits JavaScript and type declarations, so the CSS files are
 * copied separately: `dist/styles/<id>.css` matches the documented import
 * path `ai-component-libray/styles/<id>.css`.
 */

import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = path.join(repoRoot, 'src', 'components');
const targetDir = path.join(repoRoot, 'dist', 'styles');

mkdirSync(targetDir, { recursive: true });

let copied = 0;
for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const cssFile = path.join(componentsDir, entry.name, `${entry.name}.css`);
  try {
    copyFileSync(cssFile, path.join(targetDir, `${entry.name}.css`));
    copied += 1;
  } catch {
    // A component without a stylesheet simply has no style file to copy.
  }
}

process.stdout.write(`copied ${copied} stylesheet(s) to dist/styles\n`);

// The manifest is a runtime asset of the server build.
const manifestSource = path.join(repoRoot, 'src', 'manifest', 'manifest.json');
const manifestTarget = path.join(repoRoot, 'dist', 'manifest', 'manifest.json');
mkdirSync(path.dirname(manifestTarget), { recursive: true });
copyFileSync(manifestSource, manifestTarget);
process.stdout.write('copied src/manifest/manifest.json to dist/manifest\n');
