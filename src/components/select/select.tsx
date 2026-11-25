import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent } from 'react';

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
    ...rest
  },
  ref,
) {
  const generatedId = useId().replace(/:/g, '');
  const selectId = id ?? `aicl-select-${generatedId}`;

  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

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
