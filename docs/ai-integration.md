# AI integration guide

This library exposes its components to AI coding assistants (Claude Code, Claude Desktop, Cursor, Codex, …) through an **MCP server**. The assistant does not need to know the component names: it describes the requirement, searches, and receives the real source code.

```
AI assistant ──HTTP POST /mcp──▶ MCP server ──▶ manifest + component sources
                     ◀── JSON-RPC ──────────────
```

## 1. Start the server

```bash
npm ci
npm run dev:server          # http://127.0.0.1:8787
```

Environment variables:

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `8787` | HTTP port |
| `HOST` | `127.0.0.1` | Bind address |
| `AICP_MCP_TOKEN` | *(unset)* | Optional bearer token — when set, the API and the MCP endpoint require `Authorization: Bearer <token>` (see §3) |

A ready-made check of a running server (uses the official MCP client):

```bash
npm run smoke:mcp            # expects http://127.0.0.1:8787/mcp
MCP_URL=http://host:port/mcp npm run smoke:mcp
```

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST http://<host>:<port>/mcp` | MCP over Streamable HTTP (stateless) |
| `GET http://<host>:<port>/api/components` | The same search over plain REST |
| `GET http://<host>:<port>/api/components/:id` | One full manifest entry |
| `GET http://<host>:<port>/api/health` | Health probe |

## 2. Client configuration

### Claude Desktop / Claude Code (Streamable HTTP)

```jsonc
{
  "mcpServers": {
    "ai-component-libray": {
      "type": "http",
      "url": "http://127.0.0.1:8787/mcp",
      // Only needed when the server runs with AICP_MCP_TOKEN.
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
```

### Cursor (`~/.cursor/mcp.json`)

```jsonc
{
  "mcpServers": {
    "ai-component-libray": {
      "url": "http://127.0.0.1:8787/mcp"
    }
  }
}
```

### Local debugging over stdio

A stdio adapter is provided as a convenience (it is not the primary channel):

```jsonc
{
  "mcpServers": {
    "ai-component-libray": {
      "command": "npx",
      "args": ["tsx", "src/mcp/stdio.ts"]
    }
  }
}
```

## 3. Authentication

Authentication is **optional** and driven by one environment variable:

| `AICP_MCP_TOKEN` | Behaviour |
| --- | --- |
| *not set* (default) | The server does **not** check any credentials. Every request to `/api/*` and `/mcp` is served. |
| set to a non-empty value | Every request to `/api/*` and `/mcp` must carry the header `Authorization: Bearer <value>`. A missing or wrong token is answered with `401` and `{"error":{"code":"UNAUTHORIZED"}}`. `GET /api/health` stays open, so that a probe does not need the secret. |

```bash
AICP_MCP_TOKEN=$(openssl rand -hex 24) npm run dev:server
```

The token is compared in constant time; the value itself is never written to the log (the startup log only states whether authentication is enabled).

> **Security note:** without `AICP_MCP_TOKEN` the service has no access control. Do not expose it directly to the public internet — put it behind a gateway (nginx, an API gateway, an SSH tunnel) that terminates TLS and enforces authentication, or set `AICP_MCP_TOKEN`. The startup log repeats this warning.

## 4. The tools

### `search_components(query, category?, tags?, limit?)`

Finds components by natural language. Chinese and English keywords both work.

| Parameter | Type | Required | Notes |
| --- | --- | --- | --- |
| `query` | string | yes | e.g. `"表格"`, `"按钮"`, `"弹窗"`, `"table"` |
| `category` | string | no | `action`, `input`, `data-display`, `overlay`, `navigation`, `feedback` |
| `tags` | string[] | no | all tags must match |
| `limit` | number | no | default `10`, max `25` |

Returns:

```jsonc
{
  "total": 1,
  "results": [
    {
      "id": "data-table",
      "name": "DataTable",
      "title": "数据表格",
      "summary": "可排序、可分页的数据表格。",
      "description": "支持排序与分页的数据表格，用于展示结构化行数据。",
      "category": "data-display",
      "tags": ["data-table", "table", "grid", "sort", "pagination"],
      "keywords": ["表格", "数据表格", "grid"],
      "whenToUse": ["需要展示结构化行数据并支持排序或分页", "..."],
      "whenNotToUse": ["仅展示少量键值对（用 Card 即可）", "..."],
      "demoPath": "/components/data-table",
      "score": 18,
      "matchedOn": ["title", "keywords"]
    }
  ]
}
```

`whenToUse` / `whenNotToUse` exist so the model can decide *whether* the component fits before asking for the code; `score` and `matchedOn` show why it matched.

> The entry above is an **excerpt** (the real one is longer); the complete entry is returned by `GET /api/components/data-table` or `get_component({ "id": "data-table" })`.

### `get_component(id)`

Returns everything needed to land the component in a project:

| Field | Content |
| --- | --- |
| `id`, `name`, `title`, `description`, `summary`, `category`, `tags`, `keywords` | Catalogue metadata |
| `whenToUse`, `whenNotToUse` | Applicability guidance |
| `props` | The props table (`name`, `type`, `required`, `default`, `description`, `options`) |
| `dependencies`, `peerDependencies` | Dependencies (`[]` / `["react"]`) |
| `install` | `npm install ai-component-libray` |
| `usage` | Copy & paste import snippet |
| `source` | **Map of repository relative path → file content** (implementation, types, style) |
| `example` | The runnable example file |
| `readme` | The component README |
| `files` | The file list with roles |

The `source` map contains the real files, byte for byte identical to the repository.

## 5. Typical script

1. The user says: *"I need a data table that can be sorted."*
2. The assistant calls `search_components({ "query": "表格" })` → `data-table` (plus a few weaker candidates).
3. The assistant calls `get_component({ "id": "data-table" })` → source, types, props, install command.
4. The assistant writes `src/components/DataTable.tsx` (or copies the sources verbatim), adds the CSS import and the dependency.
5. The user opens `/components/data-table` in the showcase site and sees the same component running.

## 6. Error semantics

| Situation | Result |
| --- | --- |
| Unknown component id | `isError: true`, text `component not found: <id>` |
| Invalid arguments (empty query, unknown category, `limit` out of range) | `isError: true`, text explains the problem |
| Search without hits | Normal (non-error) result with `total: 0` and an empty `results` array |
| Unknown component in the REST API | `404` with `{"error":{"code":"NOT_FOUND"}}` |
| Invalid query parameter in the REST API | `400` with `{"error":{"code":"INVALID_PARAM"}}` |

Errors never crash the server: they are returned as tool results.

## 7. Using the REST API instead of MCP

```bash
curl 'http://127.0.0.1:8787/api/components?q=表格&category=data-display'
curl 'http://127.0.0.1:8787/api/components/data-table'
```

The REST API and the MCP tools share the very same search implementation (`src/core/search.ts`), so their results never drift apart.
