import type { HTMLAttributes, ReactNode } from 'react';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  /** 提示内容，显示在气泡中。 */
  content: ReactNode;
  /**
   * 气泡相对触发元素显示的方位。
   * @default "top"
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * 显示延迟（毫秒）。
   * @default 200
   */
  delay?: number;
  /**
   * 是否禁用提示，禁用时气泡永远不会出现。
   * @default false
   */
  disabled?: boolean;
  /** 触发元素，鼠标悬停或聚焦时显示提示。 */
  children: ReactNode;
}
