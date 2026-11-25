import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'card',
  name: 'Card',
  title: '卡片',
  category: 'data-display',
  tags: ['card', 'container', 'panel', 'content', 'layout'],
  keywords: ['card', '卡片', '面板', 'panel', '容器', 'container'],
  description: '通用内容容器，提供标题、描述、底部操作区与多种视觉变体。',
  summary: '通用内容卡片容器。',
  whenToUse: ['需要把一组信息组织成带标题的区块', '需要一个带操作区的信息卡片'],
  whenNotToUse: ['需要展示成行的结构化数据（请用 DataTable）', '需要展示单个指标与趋势（请用专门的指标卡）'],
  propsType: 'CardProps',
  dependencies: [],
} satisfies ComponentMeta;
