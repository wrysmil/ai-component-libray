import { useMemo, useState } from 'react';

import type { ComponentFile, ManifestEntry } from '../../../src/core/types.js';

import { CopyButton } from './CopyButton.js';

declare global {
  interface ImportMeta {
    /**
     * Vite specific glob import. Returns a map of file path → module.
     */
    glob: (
      pattern: string | string[],
      options?: { query?: string; import?: string; eager?: boolean },
    ) => Record<string, string>;
  }
}

/**
 * Raw content of every source file of the library.
 *
 * Vite inlines the files at build time (the `?raw` query returns the file
 * content byte for byte, no transformation is applied). The glob pattern is
 * relative to *this* file (`site/src/components/`), therefore it needs three
 * `../` segments to reach the repository root — the equivalent pattern
 * relative to `site/src/` would be `../../src/components/**\/*`.
 *
 * `eager: true` keeps the map synchronous, which is required for the
 * prerendered pages to contain the real source code.
 */
function loadRawModules(): Record<string, string> {
  let globbed: Record<string, string> = {};
  try {
    globbed = import.meta.glob('../../../src/components/**/*.{tsx,ts,css,md}', {
      eager: true,
      query: '?raw',
      import: 'default',
    });
  } catch {
    // Not running inside Vite (e.g. the prerender script) — the files are
    // injected through `globalThis` instead.
    globbed = {};
  }
  return { ...providedSourceFiles(), ...globbed };
}

/** Source files injected by the prerender script (Node has no Vite glob). */
function providedSourceFiles(): Record<string, string> {
  const scope = globalThis as unknown as { __AICP_SOURCE_FILES__?: Record<string, string> };
  return scope.__AICP_SOURCE_FILES__ ?? {};
}

/** Turn a glob key into a repository relative path (`src/components/...`). */
export function toRepositoryPath(key: string): string {
  return key.replace(/\\/g, '/').replace(/^(\.\.\/)+/, '').replace(/^\//, '');
}

/** All raw files, keyed by their repository relative path. */
export const rawFiles: Record<string, string> = (() => {
  const modules = loadRawModules();
  const result: Record<string, string> = {};
  for (const [key, content] of Object.entries(modules)) {
    result[toRepositoryPath(key)] = content;
  }
  return result;
})();

const ROLE_ORDER: ComponentFile['role'][] = [
  'implementation',
  'types',
  'style',
  'example',
  'readme',
];

/** The files of a component, ordered by role. */
export function orderedFiles(files: ComponentFile[]): ComponentFile[] {
  return [...files].sort((a, b) => {
    const rankA = ROLE_ORDER.indexOf(a.role);
    const rankB = ROLE_ORDER.indexOf(b.role);
    const order = (rankA === -1 ? ROLE_ORDER.length : rankA) - (rankB === -1 ? ROLE_ORDER.length : rankB);
    if (order !== 0) return order;
    return a.path.localeCompare(b.path);
  });
}

export interface SourceViewerProps {
  /** The component whose files are shown. */
  entry: ManifestEntry;
}

/**
 * The source viewer of a component: one tab per file plus the copy buttons.
 */
export function SourceViewer({ entry }: SourceViewerProps) {
  const files = useMemo(() => orderedFiles(entry.files), [entry.files]);
  const [activePath, setActivePath] = useState<string>(() => files[0]?.path ?? '');

  const activeFile = files.find((file) => file.path === activePath) ?? files[0];
  const activeContent = activeFile ? (rawFiles[activeFile.path] ?? '') : '';

  const allFilesContent = useMemo(
    () =>
      files
        .map((file) => `// ${file.path}\n${rawFiles[file.path] ?? ''}`)
        .join('\n'),
    [files],
  );

  if (files.length === 0) {
    return (
      <section className="source">
        <h2 className="section__title">Source</h2>
        <p className="source__empty">No source files are registered for this component.</p>
      </section>
    );
  }

  return (
    <section className="source">
      <div className="source__header">
        <h2 className="section__title">Source</h2>
        <div className="source__actions">
          <CopyButton
            value={activeContent}
            label="Copy source"
            description={`Copy ${activeFile ? activeFile.path : 'the current file'} to the clipboard`}
          />
          <CopyButton
            value={allFilesContent}
            label="Copy all files"
            description="Copy every file of this component to the clipboard"
          />
        </div>
      </div>
      <div className="source__tabs" role="tablist" aria-label="Component source files">
        {files.map((file) => {
          const selected = activeFile !== undefined && file.path === activeFile.path;
          return (
            <button
              key={file.path}
              type="button"
              role="tab"
              id={`tab-${file.path}`}
              aria-selected={selected}
              aria-controls={`panel-${file.path}`}
              className={`source__tab${selected ? ' source__tab--active' : ''}`}
              onClick={() => setActivePath(file.path)}
            >
              {file.role}
              <span className="source__tab-file">{file.path.split('/').pop()}</span>
            </button>
          );
        })}
      </div>
      <div
        className="source__panel"
        role="tabpanel"
        id={activeFile ? `panel-${activeFile.path}` : undefined}
        aria-labelledby={activeFile ? `tab-${activeFile.path}` : undefined}
      >
        <p className="source__path">{activeFile ? activeFile.path : ''}</p>
        <pre className="source__code" data-testid="source-content">
          <code>{activeContent}</code>
        </pre>
      </div>
    </section>
  );
}

export default SourceViewer;
