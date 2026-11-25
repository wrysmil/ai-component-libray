# Select

基于原生 `select` 的下拉选择器。支持受控（`value` + `onChange`）与非受控（`defaultValue`）两种用法，`placeholder` 会作为第一个占位选项（值为空字符串）。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { Select } from 'ai-component-libray';
import 'ai-component-libray/styles/select.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { useState } from 'react';
import { Select } from 'ai-component-libray';
import 'ai-component-libray/styles/select.css';

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
];

export function FruitPicker() {
  const [value, setValue] = useState('apple');
  return (
    <Select
      label="水果"
      options={options}
      value={value}
      onChange={setValue}
      placeholder="请选择水果"
    />
  );
}
```

非受控用法与禁用选项：

```tsx
<Select
  options={[
    { label: '可选', value: 'a' },
    { label: '禁用项', value: 'b', disabled: true },
  ]}
  defaultValue="a"
/>
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `options` | `SelectOption[]` | 是 | — | 选项列表。 |
| `value` | `string` | 否 | — | 受控值，传入后为受控模式。 |
| `defaultValue` | `string` | 否 | — | 初始值（非受控）。 |
| `onChange` | `(value: string) => void` | 否 | — | 新值回调，参数是选中项的值。 |
| `label` | `string` | 否 | — | 表单标签，与下拉框通过 id 关联。 |
| `placeholder` | `string` | 否 | — | 空值时显示的占位选项，值为空字符串。 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用下拉框。 |
| `size` | `"small" \| "medium" \| "large"` | 否 | `"medium"` | 下拉框尺寸。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |

`SelectOption` 结构：`{ label: string; value: string; disabled?: boolean }`。

其余原生 `select` 属性（`id`、`name`、`required` 等）全部透传。

> **多选暂不支持**：组件是单值选择器（受控值是 `string`），原生 `multiple` 属性被显式排除在类型之外 —— 透传它会让受控 `value` 与 `onChange` 的语义失效。需要多选时请使用原生 `select multiple` 或后续的 MultiSelect 组件。

## 示例

- 实现：`src/components/select/select.tsx`
- 类型：`src/components/select/types.ts`
- 样式：`src/components/select/select.css`
- 可运行示例：`src/components/select/example.tsx`
- 在线预览：`/components/select`

## 常见问题

**Q：`onChange` 收到的是事件还是值？** 收到的是选中的字符串值，事件对象不会透出。

**Q：占位选项可以选中吗？** 可以，它只是一个值为空字符串的普通选项，用于表示“未选择”。

**Q：受控模式下没有传 `onChange` 会怎样？** 输入会被回弹到传入的 `value`，组件会在控制台打印一条警告（`[ai-component-libray] <Select> is controlled …`）提醒补齐回调。
