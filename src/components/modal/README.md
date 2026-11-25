# Modal

模态弹窗。渲染一个固定定位的遮罩层，内部是带 `role="dialog"` 与 `aria-modal="true"` 的对话框，支持遮罩点击与 Esc 关闭、标题、底部操作区与三种尺寸。

> 组件不使用 `createPortal`，直接就地渲染，静态预渲染（SSG）场景同样可用。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { Modal } from 'ai-component-libray';
import 'ai-component-libray/styles/modal.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { useState } from 'react';
import { Modal } from 'ai-component-libray';
import 'ai-component-libray/styles/modal.css';

export function ConfirmDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        打开弹窗
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="确认删除">
        <p>删除后不可恢复，确定继续吗？</p>
      </Modal>
    </>
  );
}
```

带底部操作区与自定义关闭行为：

```tsx
<Modal
  open={open}
  onClose={handleClose}
  title="发布确认"
  size="large"
  closeOnOverlayClick={false}
  closeOnEsc={false}
  footer={<button type="button" onClick={handleClose}>发布</button>}
>
  <p>点击遮罩与 Esc 都不会关闭，只能通过底部按钮关闭。</p>
</Modal>
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | 是 | — | 是否显示弹窗，为 `false` 时不渲染任何内容。 |
| `onClose` | `() => void` | 是 | — | 关闭回调，遮罩点击、Esc 与关闭按钮都会触发。 |
| `title` | `string` | 否 | — | 弹窗标题，同时作为对话框的可访问名称。 |
| `footer` | `ReactNode` | 否 | — | 底部操作区内容。 |
| `size` | `"small" \| "medium" \| "large"` | 否 | `"medium"` | 弹窗尺寸。 |
| `closeOnOverlayClick` | `boolean` | 否 | `true` | 点击遮罩时是否关闭。 |
| `closeOnEsc` | `boolean` | 否 | `true` | 按下 Esc 时是否关闭。 |
| `className` | `string` | 否 | — | 追加到根元素（遮罩层）的类名。 |
| `style` | `CSSProperties` | 否 | — | 追加到根元素（遮罩层）的行内样式。 |

其余原生 `div` 属性（`id`、`aria-*` 等）全部透传到遮罩层。

## 示例

- 实现：`src/components/modal/modal.tsx`
- 类型：`src/components/modal/types.ts`
- 样式：`src/components/modal/modal.css`
- 可运行示例：`src/components/modal/example.tsx`
- 在线预览：`/components/modal`

## 常见问题

**Q：`open` 为 `false` 时会渲染遮罩吗？** 不会，`open` 为 `false` 时组件返回 `null`，页面上不会留下任何节点。

**Q：Esc 监听会被清理吗？** 会，`useEffect` 的清理函数会在弹窗关闭或组件卸载时移除 `keydown` 监听。
