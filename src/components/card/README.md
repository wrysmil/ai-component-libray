# Card

通用内容容器。提供标题、描述、底部操作区，支持 `default` / `outlined` / `elevated` 三种视觉变体与四档内边距。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { Card } from 'ai-component-libray';
import 'ai-component-libray/styles/card.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { Card } from 'ai-component-libray';
import 'ai-component-libray/styles/card.css';

export function ProfileCard() {
  return (
    <Card title="月度概览" description="2024 年 6 月的关键指标。">
      <p>卡片主体内容。</p>
    </Card>
  );
}
```

带底部操作区与自定义变体：

```tsx
<Card variant="elevated" padding="lg" title="订单详情" footer={<button type="button">查看全部</button>}>
  共 12 条记录
</Card>
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `string` | 否 | — | 卡片标题，显示在主体内容上方。 |
| `description` | `string` | 否 | — | 标题下方的描述文字。 |
| `footer` | `ReactNode` | 否 | — | 底部操作区内容，与主体之间有分隔线。 |
| `variant` | `"default" \| "outlined" \| "elevated"` | 否 | `"default"` | 视觉变体。 |
| `padding` | `"none" \| "sm" \| "md" \| "lg"` | 否 | `"md"` | 卡片内容的内边距。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |
| `style` | `CSSProperties` | 否 | — | 追加到根元素的行内样式。 |

其余原生 `div` 属性（`onClick`、`id`、`aria-*` 等）全部透传。

## 示例

- 实现：`src/components/card/card.tsx`
- 类型：`src/components/card/types.ts`
- 样式：`src/components/card/card.css`
- 可运行示例：`src/components/card/example.tsx`
- 在线预览：`/components/card`

## 常见问题

**Q：`title` 和 `description` 可以不传吗？** 可以，两者都为空时不会渲染头部区域。

**Q：`variant` 和 `padding` 有什么区别？** `variant` 控制外观（描边、阴影），`padding` 控制内容与卡片边缘的间距。
