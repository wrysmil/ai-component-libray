# IconButton

只有一个图标的紧凑操作按钮，用于工具栏等高密度区域。支持 `ghost` / `solid` / `outline` 三种变体与三种尺寸，可访问名称通过 `label` 渲染为 `aria-label`。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { IconButton } from 'ai-component-libray';
import 'ai-component-libray/styles/icon-button.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { IconButton } from 'ai-component-libray';
import 'ai-component-libray/styles/icon-button.css';

export function Toolbar() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <IconButton icon={<PlusIcon />} label="新建" />
      <IconButton icon={<TrashIcon />} label="删除" variant="solid" />
    </div>
  );
}
```

自定义尺寸与变体：

```tsx
<IconButton icon={<SearchIcon />} label="搜索" variant="outline" size="large" disabled />
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `icon` | `ReactNode` | 是 | — | 按钮内渲染的图标元素。 |
| `label` | `string` | 是 | — | 无障碍名称，渲染为 `aria-label`。 |
| `size` | `"small" \| "medium" \| "large"` | 否 | `"medium"` | 按钮尺寸。 |
| `variant` | `"ghost" \| "solid" \| "outline"` | 否 | `"ghost"` | 视觉变体。 |
| `disabled` | `boolean` | 否 | `false` | 禁用按钮。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |

其余原生 `button` 属性（`type`、`onClick`、`title` 等）全部透传。

## 示例

- 实现：`src/components/icon-button/icon-button.tsx`
- 类型：`src/components/icon-button/types.ts`
- 样式：`src/components/icon-button/icon-button.css`
- 可运行示例：`src/components/icon-button/example.tsx`
- 在线预览：`/components/icon-button`

## 常见问题

**Q：为什么必须传 `label`？** 图标按钮没有可见文字，`label` 会渲染为 `aria-label`，屏幕阅读器据此朗读操作名称。

**Q：`icon` 会自己被隐藏吗？** 会，图标被包裹在 `aria-hidden` 的容器中，避免与 `aria-label` 重复朗读。
