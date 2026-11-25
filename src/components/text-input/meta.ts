import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'text-input',
  name: 'TextInput',
  title: '输入框',
  category: 'input',
  tags: ['text-input', 'input', 'form', 'field', 'validation'],
  keywords: ['text input', '输入框', '文本框', '输入', '表单', 'form', 'field'],
  description: '带标签、辅助说明与错误态的受控文本输入框。',
  summary: '带标签与校验态的文本输入框。',
  whenToUse: ['需要收集单行文本（姓名、搜索词、邮箱等）', '需要展示字段级校验错误信息'],
  whenNotToUse: ['需要多行文本（请用原生 textarea）', '需要从固定选项中选择（请用 Select）'],
  propsType: 'TextInputProps',
  dependencies: [],
} satisfies ComponentMeta;
