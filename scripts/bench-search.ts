/**
 * Search benchmark: samples the search layer and reports the P95 latency.
 *
 * Run with `npm run bench:search`.
 */

import { keywordSearchProvider } from '../src/core/search.js';
import { components } from '../src/manifest/data.js';

const QUERIES = [
  '表格',
  '按钮',
  '弹窗',
  '输入框',
  'table',
  'button',
  'modal',
  'select',
  'progress',
  'card',
];

const SAMPLES = 500;

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index] ?? 0;
}

function main(): void {
  const durations: number[] = [];
  for (let i = 0; i < SAMPLES; i += 1) {
    const query = QUERIES[i % QUERIES.length] ?? '表格';
    const started = performance.now();
    keywordSearchProvider.search(components, { q: query });
    durations.push(performance.now() - started);
  }

  const p50 = percentile(durations, 50);
  const p95 = percentile(durations, 95);
  const max = percentile(durations, 100);

  process.stdout.write(
    [
      `components      : ${components.length}`,
      `samples         : ${durations.length}`,
      `p50 (ms)        : ${p50.toFixed(3)}`,
      `p95 (ms)        : ${p95.toFixed(3)}`,
      `max (ms)        : ${max.toFixed(3)}`,
      `target p95<300  : ${p95 < 300 ? 'PASS' : 'FAIL'}`,
      '',
    ].join('\n'),
  );

  if (p95 >= 300) {
    process.exitCode = 1;
  }
}

main();
