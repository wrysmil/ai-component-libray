# Tooltip

悬停或聚焦时显示的文字提示。气泡带 `role="tooltip"` 与 `id`，触发元素通过 `aria-describedby` 关联，支持四个方位与显示延迟。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { Tooltip } from 'ai-component-libray';
import 'ai-component-libray/styles/tooltip.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { Tooltip } from 'ai-component-libray';
import 'ai-component-libray/styles/tooltip.css';

export function DeleteButton() {
  return (
    <Tooltip content="删除当前条目">
      <button type="button" aria-label="删除">
        🗑
      </button>
    </Tooltip>
  );
}
```

自定义方位、延迟与禁用：

```tsx
<Tooltip content="这个提示在右侧" placement="right" delay={0}>
  <span>目标</span>
</Tooltip>

<Tooltip content="永不显示" disabled>
  <span>目标</span>
</Tooltip>
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `content` | `ReactNode` | 是 | — | 提示内容，显示在气泡中。 |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | 否 | `"top"` | 气泡相对触发元素显示的方位。 |
| `delay` | `number` | 否 | `200` | 显示延迟（毫秒）。 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用提示，禁用时气泡永远不会出现。 |
| `children` | `ReactNode` | 是 | — | 触发元素，鼠标悬停或聚焦时显示提示。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |
| `style` | `CSSProperties` | 否 | — | 追加到根元素的行内样式。 |

其余原生 `span` 属性（`id`、`onClick`、`aria-*` 等）全部透传。

## 示例

- 实现：`src/components/tooltip/tooltip.tsx`
- 类型：`src/components/tooltip/types.ts`
- 样式：`src/components/tooltip/tooltip.css`
- 可运行示例：`src/components/tooltip/example.tsx`
- 在线预览：`/components/tooltip`

## 常见问题

**Q：提示什么时候消失？** 鼠标移出或元素失焦时立即消失，按下 `Esc` 也会关闭，卸载组件时也会清理待触发的定时器。

**Q：能给图标按钮加上键盘支持吗？** 可以，气泡在 `focus` 时同样会显示，触发元素与气泡通过 `aria-describedby` 关联。

**Q：`aria-describedby` 挂在哪里？** 挂在**触发元素**上（当 `children` 是单个元素时，组件会把 `aria-describedby` 注入到该元素），因此读屏会朗读提示内容；只有当 `children` 是纯文本时，属性才留在外层包装元素上。
