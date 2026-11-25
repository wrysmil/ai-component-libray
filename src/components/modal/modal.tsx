import { forwardRef, useEffect, useId } from 'react';
import type { MouseEvent } from 'react';

import type { ModalProps } from './types.js';

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    title,
    footer,
    size = 'medium',
    closeOnOverlayClick = true,
    closeOnEsc = true,
    className,
    style,
    onClick,
    children,
    ...rest
  },
  ref,
) {
  const titleId = useId();

  useEffect(() => {
    if (!open || !closeOnEsc) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (onClick) onClick(event);
    if (event.defaultPrevented) return;
    if (closeOnOverlayClick) onClose();
  };

  const classNames = ['aicl-modal', `aicl-modal--${size}`, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classNames}
      style={style}
      data-size={size}
      onClick={handleOverlayClick}
      {...rest}
    >
      <div
        className="aicl-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Dialog'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="aicl-modal__header">
          {title ? (
            <h2 className="aicl-modal__title" id={titleId}>
              {title}
            </h2>
          ) : null}
          <button
            type="button"
            className="aicl-modal__close"
            aria-label="Close"
            onClick={() => onClose()}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="aicl-modal__body">{children}</div>

        {footer ? <div className="aicl-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
});
