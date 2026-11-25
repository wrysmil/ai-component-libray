import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { CATEGORIES } from '../../core/types.js';
import { generateManifest } from '../generate.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const componentsDir = path.join(repoRoot, 'src', 'components');

const manifest = await generateManifest();

describe('component directories', () => {
  it('contains at least 10 components', () => {
    const ids = readdirSync(componentsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    expect(ids.length).toBeGreaterThanOrEqual(10);
  });

  it('provides all six files per component', () => {
    for (const entry of manifest.components) {
      const dir = path.join(componentsDir, entry.id);
      for (const file of [
        `${entry.id}.tsx`,
        'types.ts',
        `${entry.id}.css`,
        'example.tsx',
        'README.md',
        'meta.ts',
      ]) {
        expect(existsSync(path.join(dir, file)), `${entry.id}/${file}`).toBe(true);
      }
    }
  });

  it('documents every component with install, usage and a props table', () => {
    for (const entry of manifest.components) {
      const readme = readFileSync(path.join(componentsDir, entry.id, 'README.md'), 'utf8');
      expect(readme, entry.id).toContain('## 安装 / 引入');
      expect(readme, entry.id).toContain('## 基础用法');
      expect(readme, entry.id).toContain('## Props');
      expect(readme, entry.id).toContain('npm install ai-component-libray');
      for (const prop of entry.props) {
        expect(readme, `${entry.id}/${prop.name}`).toContain(`\`${prop.name}\``);
      }
    }
  });
});

describe('manifest entries', () => {
  it('contains every component', () => {
    expect(manifest.components.length).toBeGreaterThanOrEqual(10);
  });

  it('has unique, kebab-case ids equal to the directory name', () => {
    const ids = manifest.components.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/u);
      expect(existsSync(path.join(componentsDir, id))).toBe(true);
    }
  });

  it('has all mandatory fields', () => {
    for (const entry of manifest.components) {
      expect(entry.id).toBeTruthy();
      expect(entry.name).toBeTruthy();
      expect(entry.title).toBeTruthy();
      expect(CATEGORIES).toContain(entry.category);
      expect(entry.tags.length).toBeGreaterThan(0);
      expect(entry.keywords.length).toBeGreaterThan(0);
      expect(entry.description).toBeTruthy();
      expect(entry.summary).toBeTruthy();
      expect(entry.whenToUse.length).toBeGreaterThan(0);
      expect(entry.whenNotToUse.length).toBeGreaterThan(0);
      expect(entry.dependencies).toEqual([]);
      expect(entry.peerDependencies).toEqual(['react']);
      expect(entry.framework).toBe('react');
      expect(entry.license).toBe('MIT');
      expect(entry.demoPath).toBe(`/components/${entry.id}`);
      expect(entry.install).toBe('npm install ai-component-libray');
      expect(entry.usage).toContain(`import { ${entry.name} } from 'ai-component-libray';`);
      expect(entry.examplePath).toBe(`src/components/${entry.id}/example.tsx`);
      expect(entry.files.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('derives the props from the type definitions', () => {
    for (const entry of manifest.components) {
      expect(entry.props.length).toBeGreaterThan(0);
      for (const prop of entry.props) {
        expect(prop.name).toBeTruthy();
        expect(prop.type).toBeTruthy();
        expect(prop.description).toBeTruthy();
        expect(prop.type).not.toMatch(/\bany\b/u);
        expect(prop.required).toBeTypeOf('boolean');
      }
    }
  });

  it('derives the allowed values of enum props', () => {
    const button = manifest.components.find((entry) => entry.id === 'button');
    const variant = button?.props.find((prop) => prop.name === 'variant');
    expect(variant?.options).toEqual(['primary', 'secondary', 'ghost', 'danger']);
  });

  it('exports every component from src/index.ts', () => {
    const index = readFileSync(path.join(repoRoot, 'src', 'index.ts'), 'utf8');
    for (const entry of manifest.components) {
      expect(index, entry.name).toContain(entry.name);
    }
  });

  it('covers the six categories', () => {
    const categories = new Set(manifest.components.map((entry) => entry.category));
    expect(categories.size).toBe(CATEGORIES.length);
  });
});
