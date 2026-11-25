# Showcase site

The site is the human facing half of the project: browse the catalogue, preview every component live, tweak its props and copy the source.

```bash
npm run dev:site      # http://127.0.0.1:5173
npm run build:site    # static output in site/dist/
```

## Pages

| Route | Content |
| --- | --- |
| `/` | Catalogue: every component as a card, keyword search, category filter, tag filter. All filter state is stored in the URL query string (`?q=&category=&tag=&page=`), so any view can be shared as a link and the browser back button works. |
| `/components/:id` | Component page: live preview, generated controls, props table, source viewer, install & usage. |
| `*` | 404 page with a link back to the catalogue. |

## Live preview

The preview renders the **real component** from `src/components/<id>/` — the same source that the MCP server hands to an AI and the same source that is copied to your project. There is no screenshot and no recorded GIF.

The control panel is generated from the manifest props:

| Prop shape | Control |
| --- | --- |
| `options` present (string literal union) | select box |
| `boolean` | checkbox |
| `number` | number input |
| `string` | text input |
| anything else (arrays, objects, functions) | JSON editor with an inline parse error |

## Source viewer and copy buttons

Every file of the component (implementation, types, style, example, README) can be viewed and copied. The content is imported with Vite's `?raw` imports, so it is byte for byte identical to the file in the repository. The buttons are:

- **Copy source** — copies the file currently shown.
- **Copy all files** — copies every file, each preceded by a `// path/to/file` header.
- **Copy install command** — copies `npm install ai-component-libray`.

## Build output

`npm run build:site` runs the Vite build and then a prerender step that renders every route to static HTML:

```
site/dist/index.html                     # catalogue page
site/dist/components/<id>/index.html     # one page per component
```

The prerender step fails (non-zero exit code) when the number of produced pages does not match `1 + number of components`.

## Theme and accessibility

- Light and dark themes are driven by CSS variables; the default follows `prefers-color-scheme` and the header offers a manual toggle (stored in `localStorage`).
- All interactive elements are native focusable elements with a visible `:focus-visible` outline.
- Text and surfaces use clearly different colours in both themes so the page stays readable.
