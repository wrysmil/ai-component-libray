import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style of the button.
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /**
   * Size of the button.
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Show a busy indicator and block interaction.
   * @default false
   */
  loading?: boolean;
  /** Element rendered before the label. */
  leftIcon?: ReactNode;
  /** Element rendered after the label. */
  rightIcon?: ReactNode;
}
