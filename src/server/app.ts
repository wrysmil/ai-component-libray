/**
 * Express application: the retrieval API and the MCP server share one
 * process and one port.
 */

import { timingSafeEqual } from 'node:crypto';

import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';

import type { ManifestEntry } from '../core/types.js';
import { components } from '../manifest/data.js';
import { createMcpRouter } from '../mcp/router.js';
import { createApiRouter } from './routes.js';

export interface CreateAppOptions {
  /** Manifest entries to serve; defaults to the repository manifest. */
  entries?: ManifestEntry[];
  /**
   * Bearer token required by the API and the MCP endpoint.
   *
   * Defaults to the `AICP_MCP_TOKEN` environment variable. When neither is
   * set the service runs **without** authentication (the MVP default, the
   * startup log warns about it).
   */
  token?: string | undefined;
}

/** Constant time comparison of two strings. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * The optional bearer authentication.
 *
 * It is only installed when a token is configured; `GET /api/health` stays
 * reachable so that a probe does not need the secret.
 */
function createBearerAuth(token: string) {
  const expected = `Bearer ${token}`;
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.path === '/health' || req.path === '/api/health') {
      next();
      return;
    }
    const header = req.headers.authorization ?? '';
    if (!safeEqual(header, expected)) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'missing or invalid bearer token' },
      });
      return;
    }
    next();
  };
}

/** Create the express application. */
export function createApp(options: CreateAppOptions = {}): Express {
  const entries = options.entries ?? components;
  const token = options.token ?? process.env['AICP_MCP_TOKEN'];
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  if (token) {
    app.use(createBearerAuth(token));
  }

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
