import type { HTMLAttributes } from 'react';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 当前进度值。 */
  value: number;
  /**
   * 最大值。
   * @default 100
   */
  max?: number;
  /**
   * 视觉变体。
   * @default "linear"
   */
  variant?: 'linear' | 'circular';
  /**
   * 是否显示百分比文本。
   * @default false
   */
  showLabel?: boolean;
  /** 自定义文本，传入时显示该文本而不是百分比。 */
  label?: string;
}
