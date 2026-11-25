import { forwardRef } from 'react';

import type { ProgressProps } from './types.js';

const CIRCLE_SIZE = 48;
const CIRCLE_RADIUS = 20;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value,
    max = 100,
    variant = 'linear',
    showLabel = false,
    label,
    className,
    style,
    ...rest
  },
  ref,
) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);
  const text = label ?? `${percent}%`;
  const showText = showLabel || label !== undefined;

  const classNames = [
    'aicl-progress',
    `aicl-progress--${variant}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'circular') {
    const offset = CIRCLE_CIRCUMFERENCE * (1 - clamped / safeMax);

    return (
      <div
        ref={ref}
        className={classNames}
        style={style}
        data-variant={variant}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={text}
        {...rest}
      >
        <svg
          className="aicl-progress__circle"
          width={CIRCLE_SIZE}
          height={CIRCLE_SIZE}
          viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
          aria-hidden="true"
          focusable="false"
        >
          <circle
            className="aicl-progress__track"
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={CIRCLE_RADIUS}
            fill="none"
            strokeWidth={4}
          />
          <circle
            className="aicl-progress__indicator"
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={CIRCLE_RADIUS}
            fill="none"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
          />
        </svg>
        {showText ? <span className="aicl-progress__label">{text}</span> : null}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={classNames}
      style={style}
      data-variant={variant}
      {...rest}
    >
      <div
        className="aicl-progress__track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={text}
      >
        <div
          className="aicl-progress__indicator"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showText ? <span className="aicl-progress__label">{text}</span> : null}
    </div>
  );
});
