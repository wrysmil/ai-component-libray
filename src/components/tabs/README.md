# Tabs

在若干并列视图之间切换的标签页导航。支持受控（`value`）与非受控（`defaultValue`）两种模式，并提供线型（`line`）与药丸型（`pill`）两种视觉变体。

## 安装 / 引入

```bash
npm install ai-component-libray
```

```tsx
import { Tabs } from 'ai-component-libray';
import 'ai-component-libray/styles/tabs.css';
```

> 样式使用 CSS 变量（`--aicl-*`）并带字面量兜底值，复制单个组件到其他项目也能直接工作。

## 基础用法

```tsx
import { Tabs } from 'ai-component-libray';
import 'ai-component-libray/styles/tabs.css';

export function ProfileTabs() {
  return (
    <Tabs
      tabs={[
        { id: 'posts', label: '帖子', content: <PostList /> },
        { id: 'likes', label: '点赞', content: <LikeList /> },
      ]}
      defaultValue="posts"
    />
  );
}
```

受控用法：

```tsx
const [tab, setTab] = useState('posts');

<Tabs tabs={tabs} value={tab} onChange={setTab} variant="pill" />;
```

## Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `tabs` | `TabItem[]` | 是 | — | 标签页定义列表。 |
| `value` | `string` | 否 | — | 受控选中项 id，提供后组件进入受控模式。 |
| `defaultValue` | `string` | 否 | 第一项的 `id` | 默认选中项 id，未提供时选中第一项。 |
| `onChange` | `(id: string) => void` | 否 | — | 切换选中标签时的回调。 |
| `variant` | `"line" \| "pill"` | 否 | `"line"` | 视觉变体。 |
| `className` | `string` | 否 | — | 追加到根元素的类名。 |

`TabItem` 结构：

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 是 | — | 标签唯一标识。 |
| `label` | `string` | 是 | — | 标签显示文本。 |
| `disabled` | `boolean` | 否 | `false` | 是否禁用该标签。 |
| `content` | `ReactNode` | 否 | — | 标签对应的内容。 |

其余原生 `div` 属性（`id`、`style`、`aria-*` 等）全部透传。

## 示例

- 实现：`src/components/tabs/tabs.tsx`
- 类型：`src/components/tabs/types.ts`
- 样式：`src/components/tabs/tabs.css`
- 可运行示例：`src/components/tabs/example.tsx`
- 在线预览：`/components/tabs`

## 常见问题

**Q：同时传了 `value` 和 `defaultValue` 怎么办？** 以 `value` 为准，组件进入受控模式，`defaultValue` 被忽略。

**Q：`onChange` 会收到什么？** 收到被选中的标签 `id` 字符串，便于直接写入受控状态。

**Q：键盘怎么操作？** 采用 roving tabindex：`Tab` 只进入当前选中的标签，`←` / `→`（以及 `↑` / `↓`）在标签之间移动并同时切换选中项，`Home` / `End` 跳到第一个 / 最后一个标签，禁用的标签会被跳过。

**Q：页面上有多个 Tabs 会冲突吗？** 不会，每个实例的 `id` / `aria-controls` / `aria-labelledby` 都带实例前缀。

**Q：受控模式下没有传 `onChange` 会怎样？** 标签不会切换，组件会在控制台打印一条警告提醒补齐回调。
