import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { createApp } from '../app.js';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe('GET /api/components', () => {
  it('returns every component when no filter is given', async () => {
    const response = await fetch(`${baseUrl}/api/components`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: unknown[]; total: number };
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.total).toBe(body.items.length);
    expect(body.total).toBeGreaterThanOrEqual(10);
  });

  it('matches a Chinese keyword', async () => {
    const response = await fetch(`${baseUrl}/api/components?q=${encodeURIComponent('表格')}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: { id: string }[] };
    expect(body.items.map((item) => item.id)).toContain('data-table');
  });

  it('matches an English keyword', async () => {
    const response = await fetch(`${baseUrl}/api/components?q=button`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: { id: string }[] };
    expect(body.items.map((item) => item.id)).toContain('button');
  });

  it('filters by category', async () => {
    const response = await fetch(`${baseUrl}/api/components?category=overlay`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: { category: string }[] };
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((item) => item.category === 'overlay')).toBe(true);
  });

  it('filters by tag', async () => {
    const response = await fetch(`${baseUrl}/api/components?tag=table`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: { tags: string[] }[] };
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((item) => item.tags.includes('table'))).toBe(true);
  });

  it('returns an empty array (200) when nothing matches', async () => {
    const response = await fetch(`${baseUrl}/api/components?q=zzzz-not-a-component`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: unknown[]; total: number };
    expect(body.items).toEqual([]);
    expect(body.total).toBe(0);
  });

  it('rejects an invalid category with 400', async () => {
    const response = await fetch(`${baseUrl}/api/components?category=nope`);
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: { code: string } };
    expect(body.error.code).toBe('INVALID_PARAM');
  });

  it('rejects an invalid page with 400', async () => {
    const response = await fetch(`${baseUrl}/api/components?page=0`);
    expect(response.status).toBe(400);
  });

  it('rejects a non numeric page size with 400', async () => {
    const response = await fetch(`${baseUrl}/api/components?pageSize=abc`);
    expect(response.status).toBe(400);
  });

  it('rejects a page size above the limit with 400', async () => {
    const response = await fetch(`${baseUrl}/api/components?pageSize=101`);
    expect(response.status).toBe(400);
  });

  it('paginates', async () => {
    const response = await fetch(`${baseUrl}/api/components?page=1&pageSize=2`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: unknown[]; page: number; pageSize: number; total: number };
    expect(body.items).toHaveLength(2);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(2);
    expect(body.total).toBeGreaterThan(2);
  });
});

describe('GET /api/components/:id', () => {
  it('returns the full entry', async () => {
    const response = await fetch(`${baseUrl}/api/components/data-table`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; props: unknown[]; files: unknown[] };
    expect(body.id).toBe('data-table');
    expect(body.props.length).toBeGreaterThan(0);
    expect(body.files.length).toBeGreaterThan(0);
  });

  it('returns 404 for an unknown id', async () => {
    const response = await fetch(`${baseUrl}/api/components/does-not-exist`);
    expect(response.status).toBe(404);
    const body = (await response.json()) as { error: { code: string } };
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/health', () => {
  it('reports the component count', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string; components: number };
    expect(body.status).toBe('ok');
    expect(body.components).toBeGreaterThanOrEqual(10);
  });
});
