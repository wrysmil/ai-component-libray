import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { components } from '../../manifest/data.js';
import { resolveRepoRoot } from '../paths.js';
import { getComponent, searchComponents } from '../tools.js';

describe('search_components', () => {
  it('returns candidates for the keyword "表格"', () => {
    const result = searchComponents(components, { query: '表格' });
    expect(result.total).toBeGreaterThan(0);
    expect(result.results.map((item) => item.id)).toContain('data-table');
  });

  it('returns candidates for the keyword "按钮"', () => {
    const result = searchComponents(components, { query: '按钮' });
    expect(result.total).toBeGreaterThan(0);
    expect(result.results.map((item) => item.id)).toContain('button');
  });

  it('returns candidates for the keyword "弹窗"', () => {
    const result = searchComponents(components, { query: '弹窗' });
    expect(result.total).toBeGreaterThan(0);
    expect(result.results.map((item) => item.id)).toContain('modal');
  });

  it('returns candidates for English keywords', () => {
    const result = searchComponents(components, { query: 'table' });
    expect(result.results.map((item) => item.id)).toContain('data-table');
  });

  it('returns the fields a model needs to decide', () => {
    const [first] = searchComponents(components, { query: '表格' }).results;
    expect(first).toBeDefined();
    expect(first?.id).toBeTruthy();
    expect(first?.name).toBeTruthy();
    expect(first?.summary).toBeTruthy();
    expect(first?.whenToUse.length).toBeGreaterThan(0);
    expect(first?.whenNotToUse.length).toBeGreaterThan(0);
    expect(first?.matchedOn.length).toBeGreaterThan(0);
    expect(first?.score).toBeGreaterThan(0);
  });

  it('filters by category', () => {
    const result = searchComponents(components, { query: 'a', category: 'overlay' });
    expect(result.results.every((item) => item.category === 'overlay')).toBe(true);
  });

  it('respects the limit', () => {
    const result = searchComponents(components, { query: 'a', limit: 2 });
    expect(result.results.length).toBeLessThanOrEqual(2);
  });

  it('rejects an empty query', () => {
    expect(() => searchComponents(components, { query: '  ' })).toThrow();
  });

  it('rejects an unknown category', () => {
    expect(() => searchComponents(components, { query: 'a', category: 'nope' })).toThrow();
  });

  it('rejects a limit above the maximum', () => {
    expect(() => searchComponents(components, { query: 'a', limit: 100 })).toThrow();
  });
});

describe('get_component', () => {
  it('returns the real source files, byte for byte', () => {
    const result = getComponent(components, { id: 'data-table' });
    const repoRoot = resolveRepoRoot();
    const implementationPath = 'src/components/data-table/data-table.tsx';
    expect(result.source[implementationPath]).toBeDefined();
    expect(result.source[implementationPath]).toBe(
      readFileSync(path.join(repoRoot, implementationPath), 'utf8'),
    );
  });

  it('includes the implementation and the type definitions', () => {
    const result = getComponent(components, { id: 'button' });
    const paths = Object.keys(result.source);
    expect(paths.some((file) => file.endsWith('button.tsx'))).toBe(true);
    expect(paths.some((file) => file.endsWith('types.ts'))).toBe(true);
  });

  it('returns the props table, the install command and the usage snippet', () => {
    const result = getComponent(components, { id: 'button' });
    expect(result.props.length).toBeGreaterThan(0);
    expect(result.install).toBe('npm install ai-component-libray');
    expect(result.usage).toContain("import { Button } from 'ai-component-libray';");
    expect(result.example).toContain('Button');
    expect(result.readme).toContain('# Button');
  });

  it('throws a "component not found" error for unknown ids', () => {
    expect(() => getComponent(components, { id: 'nope' })).toThrow(/component not found: nope/);
  });
});
