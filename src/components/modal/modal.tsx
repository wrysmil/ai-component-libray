import { forwardRef, useEffect, useId, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react';

import type { ModalProps } from './types.js';

/** Elements that can receive the focus inside the dialog. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    title,
    footer,
    size = 'medium',
    closeOnOverlayClick = true,
    closeOnEsc = true,
    closeLabel = '关闭',
    className,
    style,
    onClick,
    children,
    ...rest
  },
  ref,
) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

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

  /**
   * Focus management: the dialog receives the focus when it opens and the
   * focus is given back to the previously focused element when it closes.
   */
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    restoreFocusRef.current = previous instanceof HTMLElement ? previous : null;
    dialogRef.current?.focus();
    return () => {
      const target = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (target && typeof target.focus === 'function' && target.isConnected) {
        target.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  /** Only a click on the backdrop itself closes the dialog. */
  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (onClick) onClick(event);
    if (event.defaultPrevented) return;
    if (closeOnOverlayClick) onClose();
  };

  /** Keeps the keyboard focus inside the dialog (WAI-ARIA modal pattern). */
  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    const active = document.activeElement as HTMLElement | null;
    const index = active ? focusable.indexOf(active) : -1;

    let target: HTMLElement;
    if (event.shiftKey) {
      target = index <= 0 ? last : (focusable[index - 1] as HTMLElement);
    } else {
      target = index < 0 || index === focusable.length - 1 ? first : (focusable[index + 1] as HTMLElement);
    }
    event.preventDefault();
    target.focus();
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
        ref={dialogRef}
        className="aicl-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : '对话框'}
        tabIndex={-1}
        onClick={onClick}
        onKeyDown={handleDialogKeyDown}
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
            aria-label={closeLabel}
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
