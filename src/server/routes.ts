/**
 * HTTP API for component retrieval.
 *
 * The routes only parse/validate parameters and serialize the response; the
 * actual matching lives in `src/core/search.ts` so that the API, the MCP
 * tools and the showcase site share one implementation.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';

import { CATEGORIES, isCategory } from '../core/types.js';
import type { Category, ManifestEntry } from '../core/types.js';
import { keywordSearchProvider, paginate } from '../core/search.js';

export class InvalidParameterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidParameterError';
  }
}

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function parsePositiveInteger(value: unknown, name: string, max?: number): number | undefined {
  const raw = firstString(value);
  if (raw === undefined || raw === '') return undefined;
  if (!/^\d+$/u.test(raw)) {
    throw new InvalidParameterError(`${name} must be a positive integer`);
  }
  const parsed = Number.parseInt(raw, 10);
  if (parsed < 1) {
    throw new InvalidParameterError(`${name} must be >= 1`);
  }
  if (max !== undefined && parsed > max) {
    throw new InvalidParameterError(`${name} must be <= ${max}`);
  }
  return parsed;
}

/** Build the `/api` router for a given set of manifest entries. */
export function createApiRouter(entries: ManifestEntry[]): Router {
  const router = Router();

  router.get('/components', (req: Request, res: Response) => {
    let category: Category | undefined;
    let page: number | undefined;
    let pageSize: number | undefined;
    let q: string | undefined;
    let tags: string[] | undefined;

    try {
      q = firstString(req.query['q']);
      const rawCategory = firstString(req.query['category']);
      if (rawCategory !== undefined && rawCategory !== '') {
        if (!isCategory(rawCategory)) {
          throw new InvalidParameterError(
            `category must be one of ${CATEGORIES.join(', ')} (got "${rawCategory}")`,
          );
        }
        category = rawCategory;
      }
      const rawTags = allStrings(req.query['tag']).filter((tag) => tag.trim() !== '');
      tags = rawTags.length > 0 ? rawTags : undefined;
      page = parsePositiveInteger(req.query['page'], 'page');
      pageSize = parsePositiveInteger(req.query['pageSize'], 'pageSize', 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: { code: 'INVALID_PARAM', message } });
      return;
    }

    const matches = keywordSearchProvider.search(entries, { q, category, tags });
    const result = paginate(matches, page ?? 1, pageSize ?? 20);
    res.status(200).json(result);
  });

  router.get('/components/:id', (req: Request, res: Response) => {
    const entry = entries.find((candidate) => candidate.id === req.params['id']);
    if (!entry) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: `component not found: ${req.params['id']}` } });
      return;
    }
    res.status(200).json(entry);
  });

  router.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', components: entries.length });
  });

  return router;
}
