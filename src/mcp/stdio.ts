/**
 * stdio adapter for the MCP server — a local debugging convenience.
 *
 * The primary channel is Streamable HTTP (`npm run dev:server`, endpoint
 * `/mcp`); this adapter exists so that a client which only speaks stdio can
 * talk to the same tools:
 *
 *   npx tsx src/mcp/stdio.ts
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { components } from '../manifest/data.js';
import { createMcpServer } from './server.js';

async function main(): Promise<void> {
  const server = createMcpServer(components);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('ai-component-libray MCP server running on stdio\n');
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
