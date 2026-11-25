/**
 * Prerender the showcase site.
 *
 * Every route of the site (`/` and `/components/<id>`) is rendered with
 * `renderToString` and written into its own HTML file, so that the build
 * artifact contains one HTML document per component.
 *
 * The script runs under Node/tsx (ESM), therefore:
 *  * the router is a `StaticRouter` (`react-router-dom/server.js` — the `.js`
 *    suffix is required, react-router-dom v6 has no `exports` map),
 *  * the CSS imports of the component sources are stubbed with a small
 *    Node loader hook (Node cannot import CSS),
 *  * the raw source files are injected through `globalThis` because
 *    `import.meta.glob` only exists inside Vite.
 *
 * The output is deterministic: the same input always produces the same files.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { register } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(siteRoot, '..');
const distDir = path.join(siteRoot, 'dist');

const SOURCE_EXTENSIONS = new Set(['.tsx', '.ts', '.css', '.md']);

/**
 * Node cannot import CSS files. A tiny loader hook resolves every `.css`
 * import to an empty module — the styles are only needed in the browser.
 */
function registerCssStub(): void {
  const loader = [
    'export async function resolve(specifier, context, nextResolve) {',
    "  if (specifier.endsWith('.css')) {",
    "    return { url: 'data:text/javascript,export default {}', shortCircuit: true, format: 'module' };",
    '  }',
    '  return nextResolve(specifier, context);',
    '}',
  ].join('\n');
  register(`data:text/javascript,${encodeURIComponent(loader)}`);
}

/** Collect every source file of the library, keyed by repository path. */
function collectSourceFiles(directory: string, root: string): Record<string, string> {
  const files: Record<string, string> = {};
  if (!existsSync(directory)) return files;
  const entries = readdirSync(directory).sort();
  for (const entry of entries) {
    const absolute = path.join(directory, entry);
    if (statSync(absolute).isDirectory()) {
      Object.assign(files, collectSourceFiles(absolute, root));
      continue;
    }
    if (!SOURCE_EXTENSIONS.has(path.extname(entry))) continue;
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    files[relative] = readFileSync(absolute, 'utf8');
  }
  return files;
}

/**
 * Recover the shell of the built page: the built `index.html` with an empty
 * root element.
 *
 * The script has to be idempotent — running it twice must produce the very
 * same files. The second run reads the already prerendered `index.html`, so
 * the content of the root element is removed again (the matching closing tag
 * is found by counting the nested `<div>` elements).
 */
export function extractShell(html: string): string | null {
  const start = html.indexOf('<div id="root"');
  if (start === -1) return null;
  const openEnd = html.indexOf('>', start);
  if (openEnd === -1) return null;

  let depth = 1;
  let index = openEnd + 1;
  while (index < html.length && depth > 0) {
    const nextOpen = html.indexOf('<div', index);
    const nextClose = html.indexOf('</div>', index);
    if (nextClose === -1) return null;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      index = nextOpen + 4;
    } else {
      depth -= 1;
      index = nextClose + 6;
    }
  }
  if (depth !== 0) return null;

  return `${html.slice(0, start)}<div id="root"></div>${html.slice(index)}`;
}

async function main(): Promise<void> {
  registerCssStub();

  // The source viewer reads its content through `import.meta.glob` in the
  // browser; under Node the very same files are injected globally.
  const sourceFiles = collectSourceFiles(path.join(repoRoot, 'src', 'components'), repoRoot);
  (globalThis as unknown as { __AICP_SOURCE_FILES__?: Record<string, string> }).__AICP_SOURCE_FILES__ =
    sourceFiles;

  const [{ renderToString }, { StaticRouter }, { App }, { components }] = await Promise.all([
    import('react-dom/server'),
    import('react-router-dom/server.js'),
    import('../src/App.js'),
    import('../src/manifest.js'),
  ]);

  const templatePath = path.join(distDir, 'index.html');
  if (!existsSync(templatePath)) {
    console.error(
      `[prerender] ${templatePath} does not exist — run "vite build --config site/vite.config.ts" first.`,
    );
    process.exitCode = 1;
    return;
  }

  const built = readFileSync(templatePath, 'utf8');
  const template = extractShell(built);
  const marker = '<div id="root"></div>';
  if (template === null || !template.includes(marker)) {
    console.error('[prerender] the built index.html does not contain the <div id="root"></div> marker.');
    process.exitCode = 1;
    return;
  }

  const routes: string[] = ['/', ...components.map((entry) => `/components/${entry.id}`)];
  const produced: string[] = [];

  for (const route of routes) {
    const html = renderToString(
      <StaticRouter location={route}>
        <App />
      </StaticRouter>,
    );
    const page = template.replace(marker, `<div id="root">${html}</div>`);

    const outputPath =
      route === '/' ? templatePath : path.join(distDir, route.replace(/^\//, ''), 'index.html');
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, page, 'utf8');
    produced.push(path.relative(repoRoot, outputPath).split(path.sep).join('/'));
  }

  const expected = 1 + components.length;
  if (produced.length !== expected) {
    console.error(
      `[prerender] expected ${expected} HTML files (1 catalog page + ${components.length} components) but produced ${produced.length}.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`[prerender] produced ${produced.length} HTML files:`);
  for (const file of produced) {
    console.log(`  ${file}`);
  }
}

await main();
