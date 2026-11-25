import { forwardRef } from 'react';

import type { CardProps } from './types.js';

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    title,
    description,
    footer,
    variant = 'default',
    padding = 'md',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classNames = [
    'aicl-card',
    `aicl-card--${variant}`,
    `aicl-card--padding-${padding}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const hasHeader = Boolean(title) || Boolean(description);

  return (
    <div
      ref={ref}
      className={classNames}
      data-variant={variant}
      data-padding={padding}
      {...rest}
    >
      {hasHeader ? (
        <div className="aicl-card__header">
          {title ? <h3 className="aicl-card__title">{title}</h3> : null}
          {description ? <p className="aicl-card__description">{description}</p> : null}
        </div>
      ) : null}
      <div className="aicl-card__body">{children}</div>
      {footer ? <div className="aicl-card__footer">{footer}</div> : null}
    </div>
  );
});
