import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'button',
  name: 'Button',
  title: '按钮',
  category: 'action',
  tags: ['button', 'action', 'cta', 'submit', 'loading'],
  keywords: ['button', '按钮', '提交', '操作', 'primary', 'secondary', 'cta'],
  description: '触发动作的基础按钮，支持多种视觉变体、尺寸、加载态与图标。',
  summary: '可点击动作按钮，含变体、尺寸与加载态。',
  whenToUse: ['需要触发一次操作或提交表单', '需要主次操作区分（primary / secondary）'],
  whenNotToUse: ['仅用于导航到其他页面（请用链接或导航组件）', '需要开关状态（请用 Checkbox 或 Switch）'],
  propsType: 'ButtonProps',
  dependencies: [],
} satisfies ComponentMeta;
