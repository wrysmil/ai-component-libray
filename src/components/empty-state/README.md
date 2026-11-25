# EmptyState

列表或区域无数据时的占位展示。可包含图标、补充说明与底部操作入口，并提供 `sm` / `md` 两种尺寸。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { EmptyState } from 'ai-component-libray';
import 'ai-component-libray/styles/empty-state.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { EmptyState } from 'ai-component-libray';
import 'ai-component-libray/styles/empty-state.css';

export function InboxEmpty() {
  return (
    <EmptyState
      title="收件箱已清空"
      description="所有会话都已处理完毕。"
    />
  );
}
```

带图标与操作入口：

```tsx
<EmptyState
  title="还没有项目"
  description="创建第一个项目，开始与团队协作。"
  icon={<InboxIcon />}
  action={<Button>新建项目</Button>}
/>
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `string` | 是 | — | 空状态标题。 |
| `description` | `string` | 否 | — | 补充说明。 |
| `icon` | `ReactNode` | 否 | — | 标题上方的图标。 |
| `action` | `ReactNode` | 否 | — | 底部操作区（如一个 Button）。 |
| `size` | `"sm" \| "md"` | 否 | `"md"` | 尺寸。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |

其余原生 `div` 属性（`id`、`style`、`aria-*` 等）全部透传。

## 示例

- 实现：`src/components/empty-state/empty-state.tsx`
- 类型：`src/components/empty-state/types.ts`
- 样式：`src/components/empty-state/empty-state.css`
- 可运行示例：`src/components/empty-state/example.tsx`
- 在线预览：`/components/empty-state`

## 常见问题

**Q：图标会被辅助技术读出吗？** 不会，图标容器带有 `aria-hidden="true"`，仅标题与说明会被朗读。

**Q：没有操作按钮时怎么引导用户？** 可以只用 `title` 与 `description`，组件会自动省略操作区。
