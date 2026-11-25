import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'select',
  name: 'Select',
  title: '下拉选择',
  category: 'input',
  tags: ['select', 'dropdown', 'form', 'option', 'picker'],
  keywords: ['select', '下拉', '下拉框', '选择器', 'dropdown', 'picker'],
  description: '基于原生 select 的下拉选择器，支持受控/非受控与占位项。',
  summary: '原生 select 封装的下拉选择器。',
  whenToUse: ['需要从一组固定选项中单选', '选项数量不多且希望获得原生无障碍行为'],
  whenNotToUse: ['需要多选（请用带 checkbox 的自定义组件）', '选项需要远程搜索（请用带搜索的下拉）'],
  propsType: 'SelectProps',
  dependencies: [],
} satisfies ComponentMeta;
