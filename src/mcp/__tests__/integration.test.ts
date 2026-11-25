import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import { createApp } from '../../server/app.js';

let server: Server;
let client: Client;

beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address() as AddressInfo;
  client = new Client({ name: 'integration-test-client', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${address.port}/mcp`));
  await client.connect(transport);
});

afterAll(async () => {
  await client.close();
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe('MCP server over Streamable HTTP', () => {
  it('completes the initialize handshake', () => {
    expect(client.getServerVersion()?.name).toBe('ai-component-libray');
  });

  it('lists both tools', async () => {
    const tools = await client.listTools();
    const names = tools.tools.map((tool) => tool.name);
    expect(names).toContain('search_components');
    expect(names).toContain('get_component');
  });

  it('searches components through the protocol', async () => {
    const result = await client.callTool({ name: 'search_components', arguments: { query: '表格' } });
    expect(result.isError).toBeFalsy();
    const text = (result.content as { type: string; text: string }[])[0]?.text ?? '';
    const payload = JSON.parse(text) as { total: number; results: { id: string }[] };
    expect(payload.total).toBeGreaterThan(0);
    expect(payload.results.map((item) => item.id)).toContain('data-table');
  });

  it('returns the component source through the protocol', async () => {
    const result = await client.callTool({ name: 'get_component', arguments: { id: 'data-table' } });
    expect(result.isError).toBeFalsy();
    const text = (result.content as { type: string; text: string }[])[0]?.text ?? '';
    const payload = JSON.parse(text) as { id: string; source: Record<string, string> };
    expect(payload.id).toBe('data-table');
    expect(payload.source['src/components/data-table/data-table.tsx']).toContain('DataTable');
  });

  it('reports an unknown component id as an error result (not an exception)', async () => {
    const result = await client.callTool({ name: 'get_component', arguments: { id: 'nope' } });
    expect(result.isError).toBe(true);
    const text = (result.content as { type: string; text: string }[])[0]?.text ?? '';
    expect(text).toContain('component not found: nope');
  });

  it('reports invalid arguments as an error result (not an exception)', async () => {
    const result = await client.callTool({ name: 'search_components', arguments: { query: '' } });
    expect(result.isError).toBe(true);
  });
});
