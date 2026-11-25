import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { generateManifest } from '../generate.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const manifestFile = path.join(repoRoot, 'src', 'manifest', 'manifest.json');

describe('manifest consistency', () => {
  it('the committed manifest is byte identical to a fresh generation', async () => {
    const generated = await generateManifest();
    const expected = `${JSON.stringify(generated, null, 2)}\n`;
    const committed = readFileSync(manifestFile, 'utf8');
    expect(committed).toBe(expected);
  });

  it('the committed manifest is valid JSON', () => {
    const raw: unknown = JSON.parse(readFileSync(manifestFile, 'utf8'));
    expect(raw).toBeTypeOf('object');
  });
});
