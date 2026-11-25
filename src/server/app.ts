/**
 * Express application: the retrieval API and the MCP server share one
 * process and one port.
 */

import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';

import type { ManifestEntry } from '../core/types.js';
import { components } from '../manifest/data.js';
import { createMcpRouter } from '../mcp/router.js';
import { createApiRouter } from './routes.js';

export interface CreateAppOptions {
  /** Manifest entries to serve; defaults to the repository manifest. */
  entries?: ManifestEntry[];
}

/** Create the express application. */
export function createApp(options: CreateAppOptions = {}): Express {
  const entries = options.entries ?? components;
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', createApiRouter(entries));
  app.use('/mcp', createMcpRouter(entries));

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'unknown API route' } });
  });

  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: { code: 'INVALID_PARAM', message } });
  });

  return app;
}
