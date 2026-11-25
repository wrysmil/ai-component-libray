import type { HTMLAttributes, ReactNode } from 'react';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** 是否显示弹窗。 */
  open: boolean;
  /** 关闭回调，点击遮罩、按下 Esc 或点击关闭按钮时触发。 */
  onClose: () => void;
  /** 弹窗标题。 */
  title?: string;
  /** 底部操作区。 */
  footer?: ReactNode;
  /**
   * 弹窗尺寸。
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * 点击遮罩时是否关闭。
   * @default true
   */
  closeOnOverlayClick?: boolean;
  /**
   * 按下 Esc 时是否关闭。
   * @default true
   */
  closeOnEsc?: boolean;
}
