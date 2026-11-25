import { describe, expect, it } from 'vitest';

import {
  clampPageSize,
  keywordSearchProvider,
  matchesTags,
  normalize,
  paginate,
  searchComponents,
  tokenize,
} from '../search.js';
import type { ManifestEntry } from '../types.js';

function entry(overrides: Partial<ManifestEntry> & { id: string }): ManifestEntry {
  return {
    name: overrides.id,
    title: overrides.id,
    category: 'action',
    tags: [],
    keywords: [],
    description: '',
    summary: '',
    whenToUse: [],
    whenNotToUse: [],
    props: [],
    dependencies: [],
    peerDependencies: ['react'],
    framework: 'react',
    license: 'MIT',
    demoPath: `/components/${overrides.id}`,
    files: [],
    usage: '',
    install: 'npm install ai-component-libray',
    examplePath: '',
    ...overrides,
  };
}

const fixtures: ManifestEntry[] = [
  entry({
    id: 'data-table',
    name: 'DataTable',
    title: '数据表格',
    category: 'data-display',
    tags: ['table', 'sort'],
    keywords: ['表格', '数据表格', 'grid'],
    description: '支持排序与分页的数据表格。',
    summary: '可排序的数据表格。',
  }),
  entry({
    id: 'button',
    name: 'Button',
    title: '按钮',
    category: 'action',
    tags: ['button', 'action'],
    keywords: ['按钮', '提交'],
    description: '触发动作的按钮。',
    summary: '动作按钮。',
  }),
  entry({
    id: 'modal',
    name: 'Modal',
    title: '弹窗',
    category: 'overlay',
    tags: ['dialog', 'overlay'],
    keywords: ['弹窗', '对话框'],
    description: '模态弹窗。',
    summary: '模态弹窗。',
  }),
];

describe('normalize / tokenize', () => {
  it('normalizes case and whitespace', () => {
    expect(normalize('  DataTable ')).toBe('datatable');
  });

  it('keeps CJK phrases as one token', () => {
    expect(tokenize('数据表格')).toEqual(['数据表格']);
  });

  it('splits on whitespace and punctuation', () => {
    expect(tokenize('data table, modal')).toEqual(['data', 'table', 'modal']);
  });

  it('returns an empty list for an empty query', () => {
    expect(tokenize('   ')).toEqual([]);
  });
});

describe('keywordSearchProvider', () => {
  const provider = keywordSearchProvider;

  it('matches by id', () => {
    const matches = provider.search(fixtures, { q: 'data-table' });
    expect(matches[0]?.entry.id).toBe('data-table');
  });

  it('matches by title', () => {
    const matches = provider.search(fixtures, { q: '按钮' });
    expect(matches.map((match) => match.entry.id)).toContain('button');
  });

  it('matches by description', () => {
    const matches = provider.search(fixtures, { q: '分页' });
    expect(matches.map((match) => match.entry.id)).toContain('data-table');
  });

  it('matches by tag', () => {
    const matches = provider.search(fixtures, { q: 'dialog' });
    expect(matches.map((match) => match.entry.id)).toContain('modal');
  });

  it('matches by keyword synonym', () => {
    const matches = provider.search(fixtures, { q: '对话框' });
    expect(matches.map((match) => match.entry.id)).toContain('modal');
  });

  it('matches a Chinese phrase that contains a keyword', () => {
    const matches = provider.search(fixtures, { q: '表格组件' });
    expect(matches.map((match) => match.entry.id)).toContain('data-table');
  });

  it('requires every token to match (AND)', () => {
    const matches = provider.search(fixtures, { q: '表格 弹窗' });
    expect(matches).toHaveLength(0);
  });

  it('reports the matched fields', () => {
    const matches = provider.search(fixtures, { q: '按钮' });
    expect(matches[0]?.matchedOn.length).toBeGreaterThan(0);
    expect(matches[0]?.matchedOn).toContain('title');
  });

  it('returns an empty array when nothing matches', () => {
    expect(provider.search(fixtures, { q: '不存在的组件' })).toEqual([]);
  });

  it('returns everything sorted by id when the query is empty', () => {
    const matches = provider.search(fixtures, {});
    expect(matches.map((match) => match.entry.id)).toEqual(['button', 'data-table', 'modal']);
  });

  it('filters by category', () => {
    const matches = provider.search(fixtures, { category: 'overlay' });
    expect(matches.map((match) => match.entry.id)).toEqual(['modal']);
  });

  it('filters by tag', () => {
    const matches = provider.search(fixtures, { tags: ['table'] });
    expect(matches.map((match) => match.entry.id)).toEqual(['data-table']);
  });

  it('requires all tag filters to match', () => {
    expect(matchesTags(fixtures[0]!, ['table', 'sort'])).toBe(true);
    expect(matchesTags(fixtures[0]!, ['table', 'dialog'])).toBe(false);
  });

  it('treats comma separated aliases of one tag as alternatives', () => {
    expect(matchesTags(fixtures[0]!, ['table,datatable'])).toBe(true);
    expect(matchesTags(fixtures[0]!, ['table,nope'])).toBe(true);
    expect(matchesTags(fixtures[0]!, ['nope,nope2'])).toBe(false);
  });
});

describe('pagination', () => {
  it('clamps the page size', () => {
    expect(clampPageSize(undefined)).toBe(20);
    expect(clampPageSize(0)).toBe(1);
    expect(clampPageSize(1000)).toBe(100);
  });

  it('paginates after filtering', () => {
    const result = searchComponents(fixtures, { page: 1, pageSize: 2 });
    expect(result.total).toBe(3);
    expect(result.items).toHaveLength(2);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(2);
  });

  it('returns an empty page for out of range pages', () => {
    const result = searchComponents(fixtures, { page: 99, pageSize: 10 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(3);
  });

  it('keeps the total independent of the page size', () => {
    const matches = keywordSearchProvider.search(fixtures, {});
    expect(paginate(matches, 1, 1).total).toBe(3);
  });
});
