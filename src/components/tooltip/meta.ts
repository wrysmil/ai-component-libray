import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'tooltip',
  name: 'Tooltip',
  title: '文字提示',
  category: 'overlay',
  tags: ['tooltip', 'overlay', 'hint', 'popover', 'help'],
  keywords: ['tooltip', '提示', '文字提示', '气泡', 'popover', 'hint'],
  description: '悬停或聚焦时显示的文字提示，支持方位与延迟。',
  summary: '悬停/聚焦触发的文字提示气泡。',
  whenToUse: ['为图标或不熟悉的控件补充说明', '需要解释某个字段的含义而不占用布局空间'],
  whenNotToUse: ['承载重要信息或必须被阅读的内容（请用 Modal 或 Popover 面板）', '移动端主要交互场景（悬停不可用）'],
  propsType: 'TooltipProps',
  dependencies: [],
} satisfies ComponentMeta;
