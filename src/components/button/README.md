# Button

触发动作的基础按钮。支持 `primary` / `secondary` / `ghost` / `danger` 四种变体、三种尺寸、加载态与前后图标。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { Button } from 'ai-component-libray';
import 'ai-component-libray/styles/button.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { Button } from 'ai-component-libray';
import 'ai-component-libray/styles/button.css';

export function SaveButton() {
  return (
    <Button variant="primary" size="medium" onClick={() => console.log('saved')}>
      Save
    </Button>
  );
}
```

带图标与加载态：

```tsx
<Button leftIcon={<PlusIcon />} loading>Saving…</Button>
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | 否 | `"primary"` | 视觉变体。 |
| `size` | `"small" \| "medium" \| "large"` | 否 | `"medium"` | 按钮尺寸。 |
| `loading` | `boolean` | 否 | `false` | 显示加载指示并禁用交互。 |
| `leftIcon` | `ReactNode` | 否 | — | 标签前的图标。 |
| `rightIcon` | `ReactNode` | 否 | — | 标签后的图标。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |
| `disabled` | `boolean` | 否 | `false` | 禁用按钮。 |

其余原生 `button` 属性（`type`、`onClick`、`aria-*` 等）全部透传。

## 示例

- 实现：`src/components/button/button.tsx`
- 类型：`src/components/button/types.ts`
- 样式：`src/components/button/button.css`
- 可运行示例：`src/components/button/example.tsx`
- 在线预览：`/components/button`

## 常见问题

**Q：`loading` 时还能点击吗？** 不能，`loading` 会强制禁用按钮并设置 `aria-busy`。

**Q：可以改成提交表单吗？** 可以，传入 `type="submit"`。
