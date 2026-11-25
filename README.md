# ai-component-libray

An **AI-friendly React component library**: a set of reusable, fully typed components, a **retrieval API**, an **MCP server** for AI coding assistants, and a **showcase site** where humans can browse, preview and copy the source of every component.

> 人能看，AI 能用 — one single data source (the component sources) feeds the catalogue site, the REST API and the MCP server, so what a human sees is exactly what an AI gets.

| Piece | Path | What it is |
| --- | --- | --- |
| Component library | `src/components/` | 12 React 18 + TypeScript components, zero runtime dependencies besides React |
| Manifest | `src/manifest/` | Machine readable catalogue, **generated** from the sources |
| Retrieval API | `src/server/` | `GET /api/components` with keyword / category / tag filters |
| MCP server | `src/mcp/` | `search_components` + `get_component` over Streamable HTTP (`/mcp`) |
| Showcase site | `site/` | Static site: catalogue page + one live page per component |

## Quick start

```bash
npm ci                 # install from the lockfile
npm run build          # build the library and the site
npm run dev:server     # start API + MCP server on http://127.0.0.1:8787
npm run dev:site       # start the showcase site on http://127.0.0.1:5173
```

Using a component:

```tsx
import { DataTable } from 'ai-component-libray';
import 'ai-component-libray/styles/data-table.css';

<DataTable columns={columns} rows={rows} />;
```

## Components

| id | Name | Category | Description |
| --- | --- | --- | --- |
| `button` | Button | action | 触发动作的基础按钮，支持变体、尺寸、加载态与图标 |
| `icon-button` | IconButton | action | 仅图标的紧凑操作按钮（带无障碍名称） |
| `text-input` | TextInput | input | 带标签、辅助说明与错误态的受控输入框 |
| `select` | Select | input | 基于原生 select 的下拉选择器 |
| `checkbox` | Checkbox | input | 支持受控/非受控与半选状态的复选框 |
| `card` | Card | data-display | 通用内容容器（标题 / 描述 / 操作区） |
| `data-table` | DataTable | data-display | 支持排序与分页的数据表格 |
| `modal` | Modal | overlay | 模态弹窗（遮罩点击、Esc 关闭） |
| `tooltip` | Tooltip | overlay | 悬停 / 聚焦触发的文字提示 |
| `tabs` | Tabs | navigation | 受控 / 非受控的标签页导航 |
| `progress` | Progress | feedback | 线性 / 环形进度条 |
| `empty-state` | EmptyState | feedback | 无数据时的占位空状态 |

Every component ships with: implementation, `types.ts`, CSS, a runnable example, a README with a props table, and a `meta.ts` with its catalogue metadata.

## Repository layout

```
src/
├── index.ts              # public entry point (every component is registered here)
├── components/<id>/      # <id>.tsx, types.ts, <id>.css, example.tsx, README.md, meta.ts
├── core/                 # L0 domain core: types, manifest validation, the search implementation
├── manifest/             # generate.ts (generator) + manifest.json (generated artefact)
├── server/               # express app: /api/* routes
└── mcp/                  # MCP server: tools, transport, express router
site/                     # showcase site (catalogue + one page per component)
docs/                     # API contract, AI integration guide, site guide
scripts/bench-search.ts   # search latency benchmark
```

## Adding a component

1. Create `src/components/<kebab-case-id>/` with the six files above. Copy the structure of `src/components/button/`.
2. Write the props interface in `types.ts` and give **every** prop a JSDoc description — the generator rejects undocumented props. Use inline string literal unions (`variant?: 'a' | 'b'`) so the catalogue can derive the allowed values.
3. Write `meta.ts` with `satisfies ComponentMeta` (`id`, `name`, `title`, `category`, `tags`, `keywords`, `description`, `summary`, `whenToUse`, `whenNotToUse`, `propsType`, `dependencies`).
4. Register the component in `src/index.ts` — the generator fails when an export is missing.
5. Register the component in the showcase site: add an entry to `site/src/registry.ts` (the id → implementation mapping that renders the live preview) and, if the component needs a meaningful first render, its default props to `site/src/demo-props.ts`. A test (`site/src/__tests__/registry.test.ts`) fails when a component of the manifest is missing in the registry.
6. Run `npm run generate:manifest` and commit the regenerated `src/manifest/manifest.json`.
7. Run `npm run verify` (typecheck → tests → manifest diff → build).

The catalogue, the REST API and the MCP server read the generated manifest, so they need no further registration; the showcase site additionally needs the preview registration of step 5.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit` over the whole repository (strict, `noUncheckedIndexedAccess`) |
| `npm test` | Vitest: search, API, MCP tools, MCP protocol, manifest, site |
| `npm run generate:manifest` | Regenerates `src/manifest/manifest.json` from the sources |
| `npm run build:lib` | Builds `dist/` (JS + type declarations) |
| `npm run build:site` | Builds `site/dist/` and prerenders one HTML page per component |
| `npm run build` | Library + site |
| `npm run dev:server` | Runs the REST API and the MCP server |
| `npm run dev:site` | Runs the showcase site in dev mode |
| `npm run bench:search` | Search benchmark, fails when P95 ≥ 300 ms |
| `npm run smoke:mcp` | Calls a running MCP server with a standard client (search + get source) |
| `npm run verify` | The full CI chain, locally |

## Documentation

- [`docs/ai-integration.md`](docs/ai-integration.md) — connect an AI assistant (MCP client configuration, typical script)
- [`docs/api.md`](docs/api.md) — REST API contract
- [`docs/site.md`](docs/site.md) — the showcase site

## CI

The pipeline definition is kept in [`.github/ci.yml`](.github/ci.yml). GitHub Actions only picks up workflows from `.github/workflows/`, so copy it there once:

```bash
mkdir -p .github/workflows && cp .github/ci.yml .github/workflows/ci.yml
```

It then runs on every push and pull request:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npm run generate:manifest && git diff --exit-code src/manifest/manifest.json
      - run: npm run build
      - run: npm run bench:search
```

> The same chain runs locally with `npm run verify`.

## License

MIT — see [LICENSE](./LICENSE).
