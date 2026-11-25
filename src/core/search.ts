/**
 * The single search implementation of the project.
 *
 * The HTTP API, the MCP `search_components` tool and the showcase site all
 * call into this module, so the ranking rules can never drift apart.
 *
 * L0 domain core: pure functions only, no IO, no framework dependency.
 */

import type {
  ManifestEntry,
  SearchMatch,
  SearchProvider,
  SearchQuery,
  SearchResult,
} from './types.js';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Field weights used for scoring. */
export const FIELD_WEIGHTS = {
  id: 10,
  name: 9,
  title: 8,
  keywordsExact: 8,
  keywordsPartial: 6,
  tagsExact: 6,
  tagsPartial: 4,
  summary: 3,
  description: 2,
} as const;

const CJK = /[㐀-鿿]/;

/** Normalize a string for comparison: NFKC, trimmed, lower cased. */
export function normalize(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase();
}

/**
 * Split a free text query into tokens.
 *
 * Tokens are separated by whitespace and punctuation. CJK text is *not*
 * split into characters, so a phrase such as `数据表格` stays one token.
 */
export function tokenize(query: string): string[] {
  const normalized = normalize(query);
  if (!normalized) return [];
  const parts = normalized
    .split(/[\s,.;:!?/\\|()[\]{}"'`~@#$%^&*+=<>，。、；：？！（）【】「」『』…—·]/u)
    .filter((part) => part.length > 0);
  const tokens: string[] = [];
  for (const part of parts) {
    if (!tokens.includes(part)) tokens.push(part);
  }
  // The whole query is also a token so that a phrase like `数据表格组件`
  // still matches the keyword `数据表格`.
  if (!/\s/u.test(normalized) && !tokens.includes(normalized)) {
    tokens.push(normalized);
  }
  return tokens;
}

/**
 * `true` when `token` is contained in `value`.
 *
 * For CJK tokens the reverse containment is accepted as well: a query such as
 * `表格组件` contains the keyword `表格` and should therefore match.
 */
export function tokenMatches(token: string, value: string): boolean {
  const needle = normalize(token);
  const haystack = normalize(value);
  if (!needle || !haystack) return false;
  if (haystack.includes(needle)) return true;
  return CJK.test(needle) && needle.includes(haystack);
}

interface FieldHit {
  field: string;
  score: number;
}

function scoreToken(entry: ManifestEntry, token: string): { score: number; matchedOn: string[] } {
  const hits: FieldHit[] = [];

  if (tokenMatches(token, entry.id)) hits.push({ field: 'id', score: FIELD_WEIGHTS.id });
  if (tokenMatches(token, entry.name)) hits.push({ field: 'name', score: FIELD_WEIGHTS.name });
  if (tokenMatches(token, entry.title)) hits.push({ field: 'title', score: FIELD_WEIGHTS.title });

  for (const keyword of entry.keywords) {
    if (normalize(keyword) === normalize(token)) {
      hits.push({ field: 'keywords', score: FIELD_WEIGHTS.keywordsExact });
    } else if (tokenMatches(token, keyword)) {
      hits.push({ field: 'keywords', score: FIELD_WEIGHTS.keywordsPartial });
    }
  }

  for (const tag of entry.tags) {
    if (normalize(tag) === normalize(token)) {
      hits.push({ field: 'tags', score: FIELD_WEIGHTS.tagsExact });
    } else if (tokenMatches(token, tag)) {
      hits.push({ field: 'tags', score: FIELD_WEIGHTS.tagsPartial });
    }
  }

  if (tokenMatches(token, entry.summary)) hits.push({ field: 'summary', score: FIELD_WEIGHTS.summary });
  if (tokenMatches(token, entry.description)) {
    hits.push({ field: 'description', score: FIELD_WEIGHTS.description });
  }

  const score = hits.reduce((max, hit) => Math.max(max, hit.score), 0);
  const matchedOn = [...new Set(hits.map((hit) => hit.field))];
  return { score, matchedOn };
}

/** `true` when the entry satisfies every tag constraint of the query. */
export function matchesTags(entry: ManifestEntry, tags: string[] | undefined): boolean {
  if (!tags || tags.length === 0) return true;
  const entryTags = entry.tags.map((tag) => normalize(tag));
  return tags.every((constraint) => {
    const alternatives = constraint
      .split(',')
      .map((alternative) => normalize(alternative))
      .filter((alternative) => alternative.length > 0);
    if (alternatives.length === 0) return true;
    return alternatives.some((alternative) => entryTags.includes(alternative));
  });
}

/**
 * Keyword based search provider.
 *
 * All tokens of a query must match (AND). The score of an entry is the sum of
 * the best field score of every token. Results are sorted by score
 * descending, ties are broken by `id` ascending so the order is stable.
 */
export class KeywordSearchProvider implements SearchProvider {
  search(entries: ManifestEntry[], query: SearchQuery): SearchMatch[] {
    const filtered = entries.filter(
      (entry) =>
        (query.category ? entry.category === query.category : true) &&
        matchesTags(entry, query.tags),
    );

    const tokens = tokenize(query.q ?? '');
    if (tokens.length === 0) {
      return filtered
        .map((entry) => ({ entry, score: 0, matchedOn: [] as string[] }))
        .sort((a, b) => a.entry.id.localeCompare(b.entry.id));
    }

    const matches: SearchMatch[] = [];
    for (const entry of filtered) {
      let total = 0;
      const matchedOn = new Set<string>();
      let allTokensMatched = true;
      for (const token of tokens) {
        const { score, matchedOn: fields } = scoreToken(entry, token);
        if (score === 0) {
          allTokensMatched = false;
          break;
        }
        total += score;
        for (const field of fields) matchedOn.add(field);
      }
      if (!allTokensMatched) continue;
      matches.push({ entry, score: total, matchedOn: [...matchedOn] });
    }

    return matches.sort(
      (a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id),
    );
  }
}

export const keywordSearchProvider = new KeywordSearchProvider();

/** Clamp helper used by both the API and the MCP tool. */
export function clampPageSize(pageSize: number | undefined, max = MAX_PAGE_SIZE): number {
  if (pageSize === undefined || !Number.isFinite(pageSize)) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(Math.trunc(pageSize), 1), max);
}

/** Apply pagination to an already filtered & sorted match list. */
export function paginate(
  matches: SearchMatch[],
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): SearchResult {
  const safePage = Math.max(Math.trunc(page), 1);
  const safePageSize = clampPageSize(pageSize);
  const start = (safePage - 1) * safePageSize;
  return {
    items: matches.slice(start, start + safePageSize).map((match) => match.entry),
    total: matches.length,
    page: safePage,
    pageSize: safePageSize,
  };
}

/** Convenience wrapper: search + paginate in one call. */
export function searchComponents(
  entries: ManifestEntry[],
  query: SearchQuery,
  provider: SearchProvider = keywordSearchProvider,
): SearchResult {
  const matches = provider.search(entries, query);
  return paginate(matches, query.page ?? 1, query.pageSize ?? DEFAULT_PAGE_SIZE);
}
