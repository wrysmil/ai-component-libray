import { forwardRef } from 'react';

import type { ButtonProps } from './types.js';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'medium',
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled = false,
    type = 'button',
    ...rest
  },
  ref,
) {
  const classNames = [
    'aicl-button',
    `aicl-button--${variant}`,
    `aicl-button--${size}`,
    loading ? 'aicl-button--loading' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classNames}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      {loading ? (
        <span className="aicl-button__spinner" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="aicl-button__icon" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      <span className="aicl-button__label">{children}</span>
      {!loading && rightIcon ? (
        <span className="aicl-button__icon" aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
});
