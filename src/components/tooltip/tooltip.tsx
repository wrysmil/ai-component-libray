import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { FocusEvent, MouseEvent } from 'react';

import type { TooltipProps } from './types.js';

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
    ...rest
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const tooltipId = useId();

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
    if (onMouseEnter) onMouseEnter(event);
    show();
  };

  const handleMouseLeave = (event: MouseEvent<HTMLSpanElement>) => {
    if (onMouseLeave) onMouseLeave(event);
    hide();
  };

  const handleFocus = (event: FocusEvent<HTMLSpanElement>) => {
    if (onFocus) onFocus(event);
    show();
  };

  const handleBlur = (event: FocusEvent<HTMLSpanElement>) => {
    if (onBlur) onBlur(event);
    hide();
  };

  const classNames = ['aicl-tooltip', className ?? ''].filter(Boolean).join(' ');
  const visible = open && !disabled;

  return (
    <span
      ref={ref}
      className={classNames}
      style={style}
      aria-describedby={visible ? tooltipId : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    >
      {children}
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
