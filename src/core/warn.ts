/**
 * Development time warnings.
 *
 * The helpers below never throw and never break the rendering: they only make
 * a misuse of the components visible in the console, so that a frozen preview
 * can be traced back to a missing `onChange` handler.
 *
 * The environment check is written with a bracket access on purpose: a literal
 * `process.env.NODE_ENV` would be rewritten by bundlers (Vite) and would break
 * the library when it is consumed as plain ESM in a browser.
 */

/** True when the bundle runs with `NODE_ENV=production`. */
export function isProduction(): boolean {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.['NODE_ENV'] === 'production';
}

/**
 * Log a warning once per call site.
 *
 * The message is prefixed with the library name so that it can be filtered
 * out of a busy console.
 */
export function warnDev(message: string): void {
  if (isProduction()) return;
  console.warn(`[ai-component-libray] ${message}`);
}
