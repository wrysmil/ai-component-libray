/**
 * Implementation of the two MCP tools.
 *
 * These functions are pure (apart from reading the component source files
 * from disk) and therefore unit testable without an MCP server.
 */

import { readFileSync } from 'node:fs';

import { isCategory } from '../core/types.js';
import type { Category, ManifestEntry } from '../core/types.js';
import { keywordSearchProvider } from '../core/search.js';
import { resolveFromRepo } from './paths.js';

export const SEARCH_TOOL_NAME = 'search_components';
export const GET_TOOL_NAME = 'get_component';

export const DEFAULT_SEARCH_LIMIT = 10;
export const MAX_SEARCH_LIMIT = 25;

export interface SearchComponentsArgs {
  query: string;
  category?: string;
  tags?: string[];
  limit?: number;
}

export interface SearchComponentSummary {
  id: string;
  name: string;
  title: string;
  summary: string;
  description: string;
  category: Category;
  tags: string[];
  keywords: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  demoPath: string;
  /** Score of the hit, higher is better. */
  score: number;
  /** Fields that caused the match. */
  matchedOn: string[];
}

export interface SearchComponentsResult {
  total: number;
  results: SearchComponentSummary[];
}

export interface GetComponentArgs {
  id: string;
}

export interface ComponentSourceFile {
  path: string;
  role: string;
  content: string;
}

export interface GetComponentResult {
  id: string;
  name: string;
  title: string;
  description: string;
  summary: string;
  category: Category;
  tags: string[];
  keywords: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  props: ManifestEntry['props'];
  dependencies: string[];
  peerDependencies: string[];
  install: string;
  usage: string;
  demoPath: string;
  files: { path: string; role: string }[];
  /** Real file contents, keyed by repository relative path. */
  source: Record<string, string>;
  /** Content of the runnable example file. */
  example: string;
  /** Content of the component README. */
  readme: string;
}

/** Error thrown for unknown component ids; the MCP layer turns it into `isError`. */
export class ComponentNotFoundError extends Error {
  constructor(id: string) {
    super(`component not found: ${id}`);
    this.name = 'ComponentNotFoundError';
  }
}

/**
 * `search_components` implementation.
 *
 * The search itself is delegated to `src/core/search.ts`, the very same
 * implementation the HTTP API and the showcase site use.
 */
export function searchComponents(
  entries: ManifestEntry[],
  args: SearchComponentsArgs,
): SearchComponentsResult {
  const query = (args.query ?? '').trim();
  if (!query) {
    throw new Error('query must be a non-empty string');
  }
  if (args.category !== undefined && !isCategory(args.category)) {
    throw new Error(`unknown category: ${args.category}`);
  }
  const limit = args.limit ?? DEFAULT_SEARCH_LIMIT;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_SEARCH_LIMIT) {
    throw new Error(`limit must be an integer between 1 and ${MAX_SEARCH_LIMIT}`);
  }

  const matches = keywordSearchProvider.search(entries, {
    q: query,
    category: args.category as Category | undefined,
    tags: args.tags,
  });

  return {
    total: matches.length,
    results: matches.slice(0, limit).map((match) => ({
      id: match.entry.id,
      name: match.entry.name,
      title: match.entry.title,
      summary: match.entry.summary,
      description: match.entry.description,
      category: match.entry.category,
      tags: match.entry.tags,
      keywords: match.entry.keywords,
      whenToUse: match.entry.whenToUse,
      whenNotToUse: match.entry.whenNotToUse,
      demoPath: match.entry.demoPath,
      score: match.score,
      matchedOn: match.matchedOn,
    })),
  };
}

function readRepoFile(relativePath: string): string {
  return readFileSync(resolveFromRepo(relativePath), 'utf8');
}

/**
 * `get_component` implementation.
 *
 * The returned `source` map contains the *real* file contents, byte for byte
 * identical to the files in the repository.
 */
export function getComponent(
  entries: ManifestEntry[],
  args: GetComponentArgs,
): GetComponentResult {
  const id = (args.id ?? '').trim();
  if (!id) {
    throw new Error('id must be a non-empty string');
  }
  const entry = entries.find((candidate) => candidate.id === id);
  if (!entry) {
    throw new ComponentNotFoundError(id);
  }

  const source: Record<string, string> = {};
  const sourceFiles: ComponentSourceFile[] = [];
  for (const file of entry.files) {
    if (file.role !== 'implementation' && file.role !== 'types' && file.role !== 'style') {
      continue;
    }
    const content = readRepoFile(file.path);
    source[file.path] = content;
    sourceFiles.push({ path: file.path, role: file.role, content });
  }

  const exampleFile = entry.files.find((file) => file.role === 'example');
  const readmeFile = entry.files.find((file) => file.role === 'readme');

  return {
    id: entry.id,
    name: entry.name,
    title: entry.title,
    description: entry.description,
    summary: entry.summary,
    category: entry.category,
    tags: entry.tags,
    keywords: entry.keywords,
    whenToUse: entry.whenToUse,
    whenNotToUse: entry.whenNotToUse,
    props: entry.props,
    dependencies: entry.dependencies,
    peerDependencies: entry.peerDependencies,
    install: entry.install,
    usage: entry.usage,
    demoPath: entry.demoPath,
    files: entry.files.map((file) => ({ path: file.path, role: file.role })),
    source,
    example: exampleFile ? readRepoFile(exampleFile.path) : '',
    readme: readmeFile ? readRepoFile(readmeFile.path) : '',
  };
}
