import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'checkbox',
  name: 'Checkbox',
  title: '复选框',
  category: 'input',
  tags: ['checkbox', 'form', 'toggle', 'boolean', 'multi-select'],
  keywords: ['checkbox', '勾选', '复选框', '多选'],
  description: '支持受控/非受控与半选状态的复选框。',
  summary: '受控/非受控复选框，含半选态。',
  whenToUse: ['表单中需要勾选一个或多个选项', '需要表达“部分选中”的父级列表项'],
  whenNotToUse: ['互斥单选（请用 radio）', '需要立即生效的开关（请用带 onChange 的 Switch 语义组件）'],
  propsType: 'CheckboxProps',
  dependencies: [],
} satisfies ComponentMeta;
