# Retrieval API

Base URL: `http://127.0.0.1:8787` (see `npm run dev:server`).

The API serves the **generated manifest** (`src/manifest/manifest.json`) — the same data source the MCP server and the showcase site use.

## `GET /api/components`

Search the catalogue.

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `q` | string | — | Free text. Matched case-insensitively against id, name, title, keywords, tags, summary and description. Multiple words are AND-ed. |
| `category` | string | — | One of `action`, `input`, `data-display`, `overlay`, `navigation`, `feedback`. |
| `tag` | string | — | Repeatable and/or comma separated. A comma separated group is treated as alternatives (OR), separate parameters are AND-ed. |
| `page` | number | `1` | 1-based page number. |
| `pageSize` | number | `20` | 1 – 100. |

Response `200`:

```jsonc
{
  "items": [ /* ManifestEntry[] */ ],
  "total": 12,      // total number of matches (not the page size)
  "page": 1,
  "pageSize": 20
}
```

`items` is an empty array when nothing matches — a search with no hits is **not** an error.

### Manifest entry

```jsonc
{
  "id": "data-table",
  "name": "DataTable",
  "title": "数据表格",
  "category": "data-display",
  "tags": ["data-table", "table", "grid", "sort", "pagination"],
  "keywords": ["table", "datatable", "grid", "表格", "数据表格", "数据表"],
  "description": "支持排序与分页的数据表格，用于展示结构化行数据。",
  "summary": "可排序、可分页的数据表格。",
  "whenToUse": ["需要展示结构化行数据并支持排序/分页", "列定义会随业务变化的场景"],
  "whenNotToUse": ["仅展示少量键值对（用 Card 或 StatCard 即可）", "需要复杂单元格编辑（应使用专业表格方案）"],
  "props": [
    {
      "name": "columns",
      "type": "DataTableColumn<DataTableRow>[]",
      "required": true,
      "default": null,
      "description": "列定义。",
      "options": null            // non-null for string literal unions
    }
  ],
  "dependencies": [],
  "peerDependencies": ["react"],
  "framework": "react",
  "license": "MIT",
  "demoPath": "/components/data-table",
  "files": [
    { "path": "src/components/data-table/data-table.tsx", "role": "implementation" },
    { "path": "src/components/data-table/types.ts", "role": "types" },
    { "path": "src/components/data-table/data-table.css", "role": "style" },
    { "path": "src/components/data-table/example.tsx", "role": "example" },
    { "path": "src/components/data-table/README.md", "role": "readme" }
  ],
  "usage": "import { DataTable } from 'ai-component-libray';\nimport 'ai-component-libray/styles/data-table.css';",
  "install": "npm install ai-component-libray",
  "examplePath": "src/components/data-table/example.tsx"
}
```

## `GET /api/components/:id`

Returns one full `ManifestEntry` (same shape as an item above).

- `200` — the entry
- `404` — `{"error":{"code":"NOT_FOUND","message":"component not found: <id>"}}`

## `GET /api/health`

```json
{ "status": "ok", "components": 12 }
```

## Errors

| Status | Body | When |
| --- | --- | --- |
| `400` | `{"error":{"code":"INVALID_PARAM","message":"…"}}` | `page=0`, `pageSize=abc`, `pageSize>100`, unknown `category`, malformed JSON body |
| `404` | `{"error":{"code":"NOT_FOUND","message":"…"}}` | unknown component id or unknown API route |

## Ranking

The ranking is implemented once in `src/core/search.ts` and shared with the MCP tools and the showcase site:

| Field | Match | Score |
| --- | --- | --- |
| `id` | contains | 10 |
| `name` | contains | 9 |
| `title` | contains | 8 |
| `keywords` | exact / contains | 8 / 6 |
| `tags` | exact / contains | 6 / 4 |
| `summary` | contains | 3 |
| `description` | contains | 2 |

Every token of the query must match (AND). The score of an entry is the sum of the best field score per token; ties are broken by `id` ascending.

Chinese queries are supported: a token also matches when the entry's field value is contained in the token (so `表格组件` finds the keyword `表格`).

## Examples

```bash
# Chinese keyword
curl 'http://127.0.0.1:8787/api/components?q=%E8%A1%A8%E6%A0%BC'

# Category + tag filter
curl 'http://127.0.0.1:8787/api/components?category=data-display&tag=table'

# Pagination
curl 'http://127.0.0.1:8787/api/components?page=2&pageSize=5'
```
