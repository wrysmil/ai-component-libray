import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The icon element rendered inside the button.
   */
  icon: ReactNode;
  /**
   * Accessible name of the button, rendered as `aria-label`.
   */
  label: string;
  /**
   * Size of the icon button.
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Visual style of the icon button.
   * @default "ghost"
   */
  variant?: 'ghost' | 'solid' | 'outline';
  /**
   * Whether the icon button is disabled.
   * @default false
   */
  disabled?: boolean;
}
