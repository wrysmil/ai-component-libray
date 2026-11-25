import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'data-table',
  name: 'DataTable',
  title: '数据表格',
  category: 'data-display',
  tags: ['data-table', 'table', 'grid', 'sort', 'pagination', 'list'],
  keywords: ['data table', 'datatable', 'table', '表格', '数据表格', '数据表', 'grid', '排序', 'sort'],
  description: '支持排序与分页的数据表格，用于展示结构化行数据。',
  summary: '可排序、可分页的数据表格。',
  whenToUse: ['需要展示结构化行数据并支持排序或分页', '列定义会随业务变化的场景'],
  whenNotToUse: ['仅展示少量键值对（用 Card 即可）', '需要复杂单元格编辑（应使用专业表格方案）'],
  propsType: 'DataTableProps',
  dependencies: [],
} satisfies ComponentMeta;
