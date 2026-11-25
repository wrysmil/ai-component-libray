# TextInput

带标签、辅助说明与错误态的文本输入框。支持受控（`value` + `onChange`）与非受控（`defaultValue`）两种用法，`onChange` 始终返回新的字符串。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { TextInput } from 'ai-component-libray';
import 'ai-component-libray/styles/text-input.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { useState } from 'react';
import { TextInput } from 'ai-component-libray';
import 'ai-component-libray/styles/text-input.css';

export function NameField() {
  const [name, setName] = useState('');
  return (
    <TextInput
      label="姓名"
      placeholder="请输入姓名"
      value={name}
      onChange={setName}
      hint="支持中英文"
    />
  );
}
```

非受控用法与错误态：

```tsx
<TextInput label="邮箱" type="email" defaultValue="hello@example.com" />
<TextInput label="密码" type="password" error="密码至少需要 8 位" />
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `label` | `string` | 否 | — | 表单标签，与输入框通过 id 关联。 |
| `value` | `string` | 否 | — | 受控值，传入后为受控模式。 |
| `defaultValue` | `string` | 否 | — | 初始值（非受控）。 |
| `onChange` | `(value: string) => void` | 否 | — | 值变化回调，参数是新字符串。 |
| `placeholder` | `string` | 否 | — | 占位提示文本。 |
| `hint` | `string` | 否 | — | 输入框下方的辅助说明。 |
| `error` | `string` | 否 | — | 错误信息，传入后进入错误态。 |
| `required` | `boolean` | 否 | `false` | 是否为必填项。 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用输入框。 |
| `type` | `"text" \| "email" \| "password" \| "search"` | 否 | `"text"` | 输入框类型。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |

其余原生 `input` 属性（`id`、`name`、`autoComplete`、`maxLength` 等）全部透传。

## 示例

- 实现：`src/components/text-input/text-input.tsx`
- 类型：`src/components/text-input/types.ts`
- 样式：`src/components/text-input/text-input.css`
- 可运行示例：`src/components/text-input/example.tsx`
- 在线预览：`/components/text-input`

## 常见问题

**Q：同时传 `value` 和 `defaultValue` 会怎样？** `value` 优先，组件按受控模式渲染，`defaultValue` 被忽略。

**Q：错误信息会被屏幕阅读器读到吗？** 会，错误信息通过 `aria-describedby` 与输入框关联，并标记为 `role="alert"`。

**Q：受控模式下没有传 `onChange` 会怎样？** 输入会被回弹到传入的 `value`，组件会在控制台打印一条警告（`[ai-component-libray] <TextInput> is controlled …`）提醒补齐回调。
