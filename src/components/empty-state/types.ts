import type { HTMLAttributes, ReactNode } from 'react';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** 空状态标题。 */
  title: string;
  /** 补充说明。 */
  description?: string;
  /** 标题上方的图标。 */
  icon?: ReactNode;
  /** 底部操作区（如一个 Button）。 */
  action?: ReactNode;
  /**
   * 尺寸。
   * @default "md"
   */
  size?: 'sm' | 'md';
}
