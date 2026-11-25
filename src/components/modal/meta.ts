import type { ComponentMeta } from '../../core/types.js';

export const meta = {
  id: 'modal',
  name: 'Modal',
  title: '模态弹窗',
  category: 'overlay',
  tags: ['modal', 'dialog', 'overlay', 'popup', 'feedback'],
  keywords: ['modal', '弹窗', '对话框', 'dialog', 'popup', '遮罩', 'overlay'],
  description: '模态弹窗，支持遮罩点击与 Esc 关闭、多种尺寸与底部操作区。',
  summary: '模态弹窗，含遮罩与 Esc 关闭。',
  whenToUse: ['需要打断用户流程进行确认或补充信息', '需要在当前页面展示独立的任务内容'],
  whenNotToUse: ['需要持续可见的辅助信息（请用 Tooltip）', '内容很长应整页展示（请用独立页面）'],
  propsType: 'ModalProps',
  dependencies: [],
} satisfies ComponentMeta;
