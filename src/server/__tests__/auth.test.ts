import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { createApp } from '../app.js';

const TOKEN = 's3cret-token';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  // The token is configured explicitly — the same way `AICP_MCP_TOKEN` is
  // read from the environment by `createApp()`.
  const app = createApp({ token: TOKEN });
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

describe('optional bearer authentication', () => {
  it('rejects a request without the Authorization header', async () => {
    const response = await fetch(`${baseUrl}/api/components`);
    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: { code: string } };
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects a request with a wrong token', async () => {
    const response = await fetch(`${baseUrl}/api/components`, {
      headers: { Authorization: 'Bearer wrong-token' },
    });
    expect(response.status).toBe(401);
  });

  it('accepts a request with the configured token', async () => {
    const response = await fetch(`${baseUrl}/api/components`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    expect(response.status).toBe(200);
  });

  it('protects the MCP endpoint as well', async () => {
    const response = await fetch(`${baseUrl}/mcp`, { method: 'POST' });
    expect(response.status).toBe(401);

    const authorized = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: {},
          clientInfo: { name: 'auth-test', version: '1.0.0' },
        },
      }),
    });
    expect(authorized.status).toBe(200);
  });

  it('keeps the health probe reachable without the token', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
  });
});
