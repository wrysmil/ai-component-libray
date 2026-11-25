import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'progress',
  name: 'Progress',
  title: '进度条',
  category: 'feedback',
  tags: ['progress', 'feedback', 'loading', 'bar', 'status'],
  keywords: ['progress', '进度条', '进度', 'loading bar', '进度指示'],
  description: '展示任务完成进度的线性或环形进度条。',
  summary: '线性/环形进度条，含百分比文本。',
  whenToUse: ['需要反馈长任务的完成进度', '需要展示确定的完成比例（如上传、导入）'],
  whenNotToUse: ['状态不确定（请用 Button 的 loading 或骨架屏）', '需要展示业务指标数值（请用指标卡组件）'],
  propsType: 'ProgressProps',
  dependencies: [],
} satisfies ComponentMeta;
