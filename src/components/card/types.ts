import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 卡片标题。 */
  title?: string;
  /** 标题下方的描述文字。 */
  description?: string;
  /** 底部操作区内容。 */
  footer?: ReactNode;
  /**
   * 卡片的视觉变体。
   * @default "default"
   */
  variant?: 'default' | 'outlined' | 'elevated';
  /**
   * 卡片内容的内边距。
   * @default "md"
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
