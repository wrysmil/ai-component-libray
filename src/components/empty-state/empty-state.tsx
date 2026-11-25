import { forwardRef } from 'react';

import type { EmptyStateProps } from './types.js';

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    { title, description, icon, action, size = 'md', className, ...rest },
    ref,
  ) {
    const classNames = [
      'aicl-empty-state',
      `aicl-empty-state--${size}`,
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classNames} data-size={size} {...rest}>
        {icon !== undefined ? (
          <div className="aicl-empty-state__icon" aria-hidden="true">
            {icon}
          </div>
        ) : null}
        <p className="aicl-empty-state__title">{title}</p>
        {description !== undefined ? (
          <p className="aicl-empty-state__description">{description}</p>
        ) : null}
        {action !== undefined ? (
          <div className="aicl-empty-state__action">{action}</div>
        ) : null}
      </div>
    );
  },
);
