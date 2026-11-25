# Progress

展示任务完成进度的进度条。支持线性（`linear`）与环形（`circular`）两种视觉变体，并可显示百分比文本或自定义文本。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { Progress } from 'ai-component-libray';
import 'ai-component-libray/styles/progress.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { Progress } from 'ai-component-libray';
import 'ai-component-libray/styles/progress.css';

export function UploadProgress() {
  return <Progress value={45} showLabel />;
}
```

环形变体与自定义文本：

```tsx
<Progress value={45} variant="circular" showLabel />
<Progress value={45} label="上传中…" />
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `value` | `number` | 是 | — | 当前进度值。 |
| `max` | `number` | 否 | `100` | 最大值。 |
| `variant` | `"linear" \| "circular"` | 否 | `"linear"` | 视觉变体。 |
| `showLabel` | `boolean` | 否 | `false` | 是否显示百分比文本。 |
| `label` | `string` | 否 | — | 自定义文本，传入时显示该文本而不是百分比。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |

`value` 会被限制在 `[0, max]` 区间内；百分比按 `Math.round(value / max * 100)` 计算。

其余原生 `div` 属性（`id`、`style`、`aria-*` 等）全部透传。

## 示例

- 实现：`src/components/progress/progress.tsx`
- 类型：`src/components/progress/types.ts`
- 样式：`src/components/progress/progress.css`
- 可运行示例：`src/components/progress/example.tsx`
- 在线预览：`/components/progress`

## 常见问题

**Q：`value` 超过 `max` 会怎样？** 进度会被截断到 `max`，百分比最多为 100%。

**Q：`label` 和 `showLabel` 同时存在时显示什么？** 显示 `label` 传入的自定义文本。
