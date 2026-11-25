# Checkbox

支持受控（`checked` + `onChange`）与非受控（`defaultChecked`）两种用法的复选框，并支持 `indeterminate` 半选状态。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { Checkbox } from 'ai-component-libray';
import 'ai-component-libray/styles/checkbox.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { useState } from 'react';
import { Checkbox } from 'ai-component-libray';
import 'ai-component-libray/styles/checkbox.css';

export function Agreement() {
  const [accepted, setAccepted] = useState(false);
  return (
    <Checkbox
      label="我已阅读并同意服务条款"
      checked={accepted}
      onChange={setAccepted}
    />
  );
}
```

非受控用法与半选状态：

```tsx
<Checkbox label="默认勾选" defaultChecked />
<Checkbox label="部分选中" indeterminate />
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `label` | `string` | 否 | — | 复选框文本标签，点击标签可切换勾选状态。 |
| `checked` | `boolean` | 否 | — | 受控勾选状态，传入后为受控模式。 |
| `defaultChecked` | `boolean` | 否 | `false` | 初始勾选状态（非受控）。 |
| `onChange` | `(checked: boolean) => void` | 否 | — | 勾选状态变化回调，参数是新的勾选状态。 |
| `indeterminate` | `boolean` | 否 | `false` | 半选状态，通过 DOM property 设置。 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用复选框。 |
| `name` | `string` | 否 | — | 表单字段名。 |
| `value` | `string` | 否 | `"on"` | 表单提交时携带的值。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |

其余原生 `input` 属性（`id`、`form`、`aria-*` 等）全部透传。

## 示例

- 实现：`src/components/checkbox/checkbox.tsx`
- 类型：`src/components/checkbox/types.ts`
- 样式：`src/components/checkbox/checkbox.css`
- 可运行示例：`src/components/checkbox/example.tsx`
- 在线预览：`/components/checkbox`

## 常见问题

**Q：`onChange` 收到的是事件吗？** 不是，收到的是新的布尔勾选状态。

**Q：半选状态怎么实现？** 传入 `indeterminate`，组件会设置原生 `input.indeterminate` 属性并同步 `aria-checked="mixed"`。
