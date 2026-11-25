/**
 * Smoke test for a running MCP server.
 *
 *   npm run dev:server            # in one terminal
 *   npx tsx scripts/mcp-smoke.ts  # in another one
 *
 * The endpoint can be overridden with `MCP_URL`.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const url = process.env['MCP_URL'] ?? 'http://127.0.0.1:8787/mcp';

async function main(): Promise<void> {
  const client = new Client({ name: 'mcp-smoke', version: '1.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(url)));

  process.stdout.write(`server        : ${JSON.stringify(client.getServerVersion())}\n`);

  const tools = await client.listTools();
  process.stdout.write(`tools         : ${tools.tools.map((tool) => tool.name).join(', ')}\n`);

  for (const query of ['表格', '按钮', '弹窗']) {
    const result = await client.callTool({ name: 'search_components', arguments: { query } });
    const payload = JSON.parse((result.content as { text: string }[])[0]!.text) as {
      total: number;
      results: { id: string }[];
    };
    process.stdout.write(
      `search "${query}" -> ${payload.total} hit(s): ${payload.results.map((item) => item.id).join(', ')}\n`,
    );
  }

  const component = await client.callTool({ name: 'get_component', arguments: { id: 'data-table' } });
  const payload = JSON.parse((component.content as { text: string }[])[0]!.text) as {
    source: Record<string, string>;
    install: string;
  };
  process.stdout.write(
    `get_component  -> ${Object.keys(payload.source).length} source file(s), install: ${payload.install}\n`,
  );

  await client.close();
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
