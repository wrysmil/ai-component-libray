import { forwardRef } from 'react';

import type { IconButtonProps } from './types.js';

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    label,
    size = 'medium',
    variant = 'ghost',
    disabled = false,
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  const classNames = [
    'aicl-icon-button',
    `aicl-icon-button--${variant}`,
    `aicl-icon-button--${size}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classNames}
      disabled={disabled}
      aria-label={label}
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      <span className="aicl-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
});
