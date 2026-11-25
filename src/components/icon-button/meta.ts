import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'icon-button',
  name: 'IconButton',
  title: '图标按钮',
  category: 'action',
  tags: ['icon-button', 'icon', 'toolbar', 'action'],
  keywords: ['icon button', '图标按钮', '图标', '工具栏', 'toolbar'],
  description: '只有一个图标的紧凑操作按钮，用于工具栏等高密度区域。',
  summary: '仅图标的紧凑操作按钮。',
  whenToUse: ['工具栏等高密度区域需要紧凑操作入口', '操作图标本身含义明确、需要无障碍名称时'],
  whenNotToUse: ['图标含义不明确、需要文字说明时', '普通表单提交场景（请用 Button）'],
  propsType: 'IconButtonProps',
  dependencies: [],
} satisfies ComponentMeta;
