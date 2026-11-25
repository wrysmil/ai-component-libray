/**
 * MCP server exposing the two retrieval tools.
 *
 * The server is created per request (a `McpServer` instance can only be
 * connected to a single transport), the tool implementations themselves are
 * shared and unit tested in `tools.ts`.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { CATEGORIES } from '../core/types.js';
import type { ManifestEntry } from '../core/types.js';
import {
  GET_TOOL_NAME,
  MAX_SEARCH_LIMIT,
  SEARCH_TOOL_NAME,
  getComponent,
  searchComponents,
} from './tools.js';
import type { GetComponentArgs, SearchComponentsArgs } from './tools.js';

function readVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8'),
    ) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/** Create a fresh MCP server with both tools registered. */
export function createMcpServer(entries: ManifestEntry[]): McpServer {
  const server = new McpServer({
    name: 'ai-component-libray',
    version: readVersion(),
  });

  server.registerTool(
    SEARCH_TOOL_NAME,
    {
      title: 'Search components',
      description:
        'Search the component library by natural language keywords (Chinese or English). ' +
        'Returns candidate components with their id, name, summary, applicable scenarios, ' +
        'tags and the fields that matched, so the model can pick the right one.',
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe('Natural language keywords, e.g. "表格", "按钮", "弹窗", "table".'),
        category: z
          .enum(CATEGORIES)
          .optional()
          .describe('Optional category filter: action, input, data-display, overlay, navigation, feedback.'),
        tags: z.array(z.string()).optional().describe('Optional tag filters, all of them must match.'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(MAX_SEARCH_LIMIT)
          .optional()
          .describe(`Maximum number of results (default 10, max ${MAX_SEARCH_LIMIT}).`),
      },
    },
    async (args: SearchComponentsArgs) => {
      try {
        const result = searchComponents(entries, args);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            { type: 'text' as const, text: error instanceof Error ? error.message : String(error) },
          ],
        };
      }
    },
  );

  server.registerTool(
    GET_TOOL_NAME,
    {
      title: 'Get component',
      description:
        'Get everything needed to use a component: the real implementation source, the type ' +
        'definitions, the props table, dependencies, the install command and a usage snippet.',
      inputSchema: {
        id: z.string().min(1).describe('Component id, e.g. "data-table".'),
      },
    },
    async (args: GetComponentArgs) => {
      try {
        const result = getComponent(entries, args);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            { type: 'text' as const, text: error instanceof Error ? error.message : String(error) },
          ],
        };
      }
    },
  );

  return server;
}
