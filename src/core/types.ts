/**
 * Shared domain types for the component library, the manifest and the search layer.
 *
 * This module is part of the L0 "domain core": it must stay free of any
 * runtime dependency (no React, no `node:*`, no IO) so that the HTTP API,
 * the MCP server and the browser side showcase site can all share it.
 */

/** The closed set of component categories. */
export const CATEGORIES = [
  'action',
  'input',
  'data-display',
  'overlay',
  'navigation',
  'feedback',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Narrow an arbitrary value to a {@link Category}. */
export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);
}

/** The role a file plays inside a component directory. */
export type FileRole = 'implementation' | 'types' | 'style' | 'readme' | 'example';

export interface ComponentFile {
  /** Repository relative POSIX path, e.g. `src/components/button/button.tsx`. */
  path: string;
  role: FileRole;
}

/** Machine readable description of a single prop, derived from `types.ts`. */
export interface PropMeta {
  name: string;
  /** Type text as written in `types.ts`, stripped of import() prefixes. */
  type: string;
  required: boolean;
  /** Value of the `@default` JSDoc tag, `null` when absent. */
  default: string | null;
  /** JSDoc description of the prop. */
  description: string;
  /** Allowed values when the prop is a string literal union, otherwise `null`. */
  options: string[] | null;
}

/** A single component entry of the machine readable manifest. */
export interface ManifestEntry {
  /** kebab-case id, equal to the component directory name. */
  id: string;
  /** Exported component name, must be exported from `src/index.ts`. */
  name: string;
  /** Human readable title. */
  title: string;
  category: Category;
  tags: string[];
  /** Aliases / synonyms (including Chinese) used by the search layer. */
  keywords: string[];
  description: string;
  /** Short summary used in search results. */
  summary: string;
  whenToUse: string[];
  whenNotToUse: string[];
  props: PropMeta[];
  /** Runtime dependencies of the component itself (empty in the MVP). */
  dependencies: string[];
  peerDependencies: string[];
  framework: 'react';
  license: 'MIT';
  /** Path of the showcase site page, e.g. `/components/button`. */
  demoPath: string;
  files: ComponentFile[];
  /** Copy & paste usage snippet. */
  usage: string;
  /** Install command. */
  install: string;
  /** Repository relative path of the runnable example. */
  examplePath: string;
}

/** The manifest document: version + component entries. */
export interface Manifest {
  version: string;
  components: ManifestEntry[];
}

/**
 * The hand written part of a component's metadata (`meta.ts`).
 *
 * Everything derivable (props, files, usage, install, demo path, ...) is
 * produced by the manifest generator so that it can never drift from the
 * actual source files.
 */
export interface ComponentMeta {
  id: string;
  name: string;
  title: string;
  category: Category;
  tags: string[];
  keywords: string[];
  description: string;
  summary: string;
  whenToUse: string[];
  whenNotToUse: string[];
  /** Name of the exported props interface inside `types.ts`. */
  propsType: string;
  /** Runtime dependencies of the component (keep empty unless justified). */
  dependencies: string[];
}

/** Query understood by the search layer. */
export interface SearchQuery {
  /** Free text query; empty / undefined means "everything". */
  q?: string;
  category?: Category;
  /**
   * Tag filters. Every entry must match; an entry may itself contain
   * comma separated alternatives which are then OR-ed.
   */
  tags?: string[];
  page?: number;
  pageSize?: number;
}

/** A single scored search hit. */
export interface SearchMatch {
  entry: ManifestEntry;
  score: number;
  /** Names of the fields that caused the match, e.g. `["title", "keywords"]`. */
  matchedOn: string[];
}

/** Paged search response used by the HTTP API and the MCP tool. */
export interface SearchResult {
  items: ManifestEntry[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Pluggable search backend. The MVP ships a keyword implementation; a future
 * semantic/vector implementation can be dropped in without changing the HTTP
 * or MCP contract.
 */
export interface SearchProvider {
  search(entries: ManifestEntry[], query: SearchQuery): SearchMatch[];
}
