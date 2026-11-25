import { forwardRef, useEffect, useId, useState } from 'react';
import type { ChangeEvent } from 'react';

import { warnDev } from '../../core/warn.js';
import type { SelectProps } from './types.js';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue,
    onChange,
    label,
    placeholder,
    disabled = false,
    size = 'medium',
    className,
    style,
    id,
    'aria-label': ariaLabelProp,
    ...rest
  },
  ref,
) {
  const generatedId = useId().replace(/:/g, '');
  const selectId = id ?? `aicl-select-${generatedId}`;

  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (isControlled && !onChange) {
      warnDev(
        '<Select> is controlled (`value` was provided) but has no `onChange` handler — ' +
          'the selection cannot change.',
      );
    }
  }, [isControlled, onChange]);

  useEffect(() => {
    if (!label && !ariaLabelProp) {
      warnDev(
        '<Select> has neither a `label` nor an `aria-label` — the select has no ' +
          'accessible name.',
      );
    }
  }, [label, ariaLabelProp]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  const classNames = [
    'aicl-select',
    `aicl-select--${size}`,
    disabled ? 'aicl-select--disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} style={style} data-size={size}>
      {label ? (
        <label className="aicl-select__label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <div className="aicl-select__control-wrapper">
        <select
          ref={ref}
          id={selectId}
          className="aicl-select__control"
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          aria-label={ariaLabelProp}
          {...rest}
        >
          {placeholder ? (
            <option value="">{placeholder}</option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="aicl-select__caret" aria-hidden="true" />
      </div>
    </div>
  );
});
