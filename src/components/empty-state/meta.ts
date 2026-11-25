import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'empty-state',
  name: 'EmptyState',
  title: '空状态',
  category: 'feedback',
  tags: ['empty-state', 'placeholder', 'feedback', 'status', 'list'],
  keywords: ['empty state', 'empty', '空状态', '空态', '占位', 'placeholder', 'no data'],
  description: '列表或区域无数据时的占位展示，含图标、说明与操作入口。',
  summary: '无数据时的占位空状态。',
  whenToUse: ['列表、搜索结果或图表没有任何数据时', '需要给用户下一步动作的提示（如"新建"）'],
  whenNotToUse: ['数据加载中（请用加载态或骨架屏）', '数据加载失败（请用错误态组件）'],
  propsType: 'EmptyStateProps',
  dependencies: [],
} satisfies ComponentMeta;
