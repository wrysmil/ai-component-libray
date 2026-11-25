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
  onSortChange={(key) => console.log('sorted by', key)}
/>
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `columns` | `DataTableColumn<DataTableRow>[]` | 是 | — | 列定义，包含 key、title、sortable、width、render。 |
| `rows` | `DataTableRow[]` | 是 | — | 行数据（当前页数据）。 |
| `sortBy` | `string` | 否 | — | 受控排序列 key。 |
| `defaultSortBy` | `string` | 否 | — | 默认排序列 key（非受控时生效）。 |
| `onSortChange` | `(key: string) => void` | 否 | — | 点击可排序表头时回调新的列 key。 |
| `pageSize` | `number` | 否 | `10` | 每页行数。 |
| `emptyText` | `string` | 否 | `"暂无数据"` | 空数据时的占位文案。 |
| `loading` | `boolean` | 否 | `false` | 加载中状态，加载时显示加载占位而不是数据行。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |
| `style` | `CSSProperties` | 否 | — | 追加到根元素的行内样式。 |

其余原生 `div` 属性（`id`、`aria-*` 等）全部透传。

## 示例

- 实现：`src/components/data-table/data-table.tsx`
- 类型：`src/components/data-table/types.ts`
- 样式：`src/components/data-table/data-table.css`
- 可运行示例：`src/components/data-table/example.tsx`
- 在线预览：`/components/data-table`

## 常见问题

**Q：分页是组件内部做的吗？** 是，`rows` 会被按 `pageSize` 内部切片，超过一页时底部出现翻页条。

**Q：排序怎么和外部状态配合？** 传 `sortBy` 变成受控模式，同时用 `onSortChange` 拿到新的列 key 后更新自己的数据源。
