/**
 * Express router that exposes the MCP server over Streamable HTTP.
 *
 * The transport runs in stateless mode (`sessionIdGenerator: undefined`), so
 * every request gets its own `McpServer` + transport instance.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import type { ManifestEntry } from '../core/types.js';
import { createMcpServer } from './server.js';

const MCP_PATH = /^\/?$/u;

function methodNotAllowed(res: Response): void {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null,
    }),
  );
}

/** Build the `/mcp` router. */
export function createMcpRouter(entries: ManifestEntry[]): Router {
  const router = Router();

  router.post(MCP_PATH, async (req: Request, res: Response) => {
    const server = createMcpServer(entries);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on('close', () => {
        void transport.close();
        void server.close();
      });
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  router.get(MCP_PATH, (_req: Request, res: Response) => {
    methodNotAllowed(res);
  });

  router.delete(MCP_PATH, (_req: Request, res: Response) => {
    methodNotAllowed(res);
  });

  return router;
}
