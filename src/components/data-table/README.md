# DataTable

支持排序与分页的数据表格。使用真实的 `<table>` 语义，可排序列的表头是按钮，并带有 `aria-sort`；空数据与加载态都有独立占位。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { DataTable } from 'ai-component-libray';
import 'ai-component-libray/styles/data-table.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { DataTable } from 'ai-component-libray';
import 'ai-component-libray/styles/data-table.css';

const columns = [
  { key: 'name', title: '名称', sortable: true },
  { key: 'status', title: '状态' },
];

const rows = [
  { name: '登录页改版', status: '进行中' },
  { name: '数据看板', status: '待启动' },
];

export function ProjectTable() {
  return <DataTable columns={columns} rows={rows} />;
}
```

行数据可以是任意类型：`DataTable` 对行类型做了泛型，`interface` 定义的行同样可以直接传入（`render` 回调拿到的就是精确类型）：

```tsx
interface Project {
  id: string;
  name: string;
  status: 'active' | 'done';
}

const columns: DataTableColumn<Project>[] = [
  { key: 'name', title: '名称', sortable: true },
  // row 是 Project —— `row.status` 不需要再 String(row.status)
  { key: 'status', title: '状态', render: (row) => <StatusTag value={row.status} /> },
];

<DataTable<Project> columns={columns} rows={projects} />
```

自定义单元格与分页：

```tsx
<DataTable
  columns={[
    { key: 'name', title: '名称', sortable: true, width: '200px' },
    {
      key: 'status',
      title: '状态',
      render: (row) => <StatusTag value={String(row.status)} />,
    },
  ]}
  rows={rows}
  pageSize={20}
  emptyText="暂无数据"
  rowKey={(row) => row.id}
  onSortChange={(key, direction) => console.log('sorted by', key, direction)}
/>
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `columns` | `DataTableColumn<DataTableRow>[]` | 是 | — | 列定义，包含 key、title、sortable、width、render。 |
| `rows` | `DataTableRow[]` | 是 | — | 全部行数据，组件内部按 `pageSize` 分页。 |
| `rowKey` | `(row: Row, index: number) => string` | 否 | `row.id` 或行下标 | 行 key 生成器，保证翻页/排序后行节点不被错误复用。 |
| `sortBy` | `string` | 否 | — | 受控排序列 key。 |
| `defaultSortBy` | `string` | 否 | — | 默认排序列 key（非受控时生效）。 |
| `sortDirection` | `"ascending" \| "descending"` | 否 | — | 受控排序方向。 |
| `defaultSortDirection` | `"ascending" \| "descending"` | 否 | `"ascending"` | 默认排序方向（非受控时生效）。 |
| `onSortChange` | `(key: string, direction: SortDirection) => void` | 否 | — | 点击可排序表头时回调新的列 key 与排序方向（同一列再次点击会切换方向）。 |
| `pageSize` | `number` | 否 | `10` | 每页行数。 |
| `emptyText` | `string` | 否 | `"暂无数据"` | 空数据时的占位文案。 |
| `loading` | `boolean` | 否 | `false` | 加载中状态，加载时显示加载占位而不是数据行。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |
| `style` | `CSSProperties` | 否 | — | 追加到根元素的行内样式。 |

其余原生 `div` 属性（`id`、`aria-*` 等）全部透传。

`DataTable` 对行类型做了泛型（`DataTable<Row>` / `DataTableProps<Row>` / `DataTableColumn<Row>`），默认的行类型是宽松的 `DataTableRow = Record<string, unknown>`。

## 示例

- 实现：`src/components/data-table/data-table.tsx`
- 类型：`src/components/data-table/types.ts`
- 样式：`src/components/data-table/data-table.css`
- 可运行示例：`src/components/data-table/example.tsx`
- 在线预览：`/components/data-table`

## 常见问题

**Q：分页是组件内部做的吗？** 是，传入的是**全部**行数据，组件内部按 `pageSize` 切片，超过一页时底部出现翻页条。

**Q：排序怎么和外部状态配合？** 传 `sortBy` 变成受控模式，同时用 `onSortChange` 拿到新的列 key 与方向后更新自己的数据源。

**Q：为什么需要 `rowKey`？** 翻页或排序后 React 会复用行节点，默认用 `row.id`（没有 `id` 时用行下标）作为 key；如果行的内容带有内部状态，请自己提供一个稳定的 `rowKey`。
