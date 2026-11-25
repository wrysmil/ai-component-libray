/**
 * Process entry point of the retrieval API + MCP server.
 */

import { createApp } from './app.js';
import { components } from '../manifest/data.js';

const port = Number.parseInt(process.env['PORT'] ?? '8787', 10);
const host = process.env['HOST'] ?? '127.0.0.1';

const app = createApp();

app.listen(port, host, () => {
  process.stdout.write(
    [
      `ai-component-libray server listening on http://${host}:${port}`,
      `  REST API : http://${host}:${port}/api/components`,
      `  MCP      : http://${host}:${port}/mcp (Streamable HTTP)`,
      `  components: ${components.length}`,
      '  NOTE: no authentication is enabled — put this service behind a gateway in production.',
      '',
    ].join('\n'),
  );
});
