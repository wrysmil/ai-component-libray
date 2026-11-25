import { cloneElement, forwardRef, isValidElement, useEffect, useId, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent, MouseEvent, ReactElement } from 'react';

import type { TooltipProps } from './types.js';

interface TriggerProps {
  'aria-describedby'?: string;
}

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  {
    content,
    placement = 'top',
    delay = 200,
    disabled = false,
    children,
    className,
    style,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  // `useId` produces ids with colons (`:r0:`), which are not valid in a CSS
  // selector — they are stripped so that `#id` works for the consumer.
  const tooltipId = `aicl-tooltip-${useId().replace(/:/g, '')}`;

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Always drop the pending timer when the component goes away.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // A disabled tooltip never shows, not even while it is already open.
  useEffect(() => {
    if (!disabled) return;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
  }, [disabled]);

  const show = () => {
    if (disabled) return;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setOpen(true);
    }, delay);
  };

  const hide = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLSpanElement>) => {
    onMouseEnter?.(event);
    show();
  };

  const handleMouseLeave = (event: MouseEvent<HTMLSpanElement>) => {
    onMouseLeave?.(event);
    hide();
  };

  const handleFocus = (event: FocusEvent<HTMLSpanElement>) => {
    onFocus?.(event);
    show();
  };

  const handleBlur = (event: FocusEvent<HTMLSpanElement>) => {
    onBlur?.(event);
    hide();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    // Escape dismisses the bubble.
    if (event.key === 'Escape') {
      hide();
    }
  };

  const classNames = ['aicl-tooltip', className ?? ''].filter(Boolean).join(' ');
  const visible = open && !disabled;

  /**
   * The accessible name of the bubble has to live on the element the user
   * actually interacts with. When `children` is a single element, the
   * `aria-describedby` attribute is injected into it; otherwise it stays on
   * the wrapper (the only element that then carries the description).
   */
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<TriggerProps>, {
        'aria-describedby': visible
          ? tooltipId
          : (children as ReactElement<TriggerProps>).props['aria-describedby'],
      })
    : children;

  return (
    <span
      ref={ref}
      className={classNames}
      style={style}
      aria-describedby={visible && !isValidElement(children) ? tooltipId : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {trigger}
      {visible ? (
        <span
          role="tooltip"
          id={tooltipId}
          className={`aicl-tooltip__bubble aicl-tooltip__bubble--${placement}`}
          data-placement={placement}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
});
