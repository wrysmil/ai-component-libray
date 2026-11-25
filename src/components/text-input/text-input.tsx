import { forwardRef, useEffect, useId, useState } from 'react';
import type { ChangeEvent } from 'react';

import { warnDev } from '../../core/warn.js';
import type { TextInputProps } from './types.js';

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    label,
    value,
    defaultValue,
    onChange,
    placeholder,
    hint,
    error,
    required = false,
    disabled = false,
    type = 'text',
    className,
    style,
    id,
    'aria-describedby': ariaDescribedByProp,
    'aria-invalid': ariaInvalidProp,
    ...rest
  },
  ref,
) {
  const generatedId = useId().replace(/:/g, '');
  const inputId = id ?? `aicl-text-input-${generatedId}`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (isControlled && !onChange) {
      warnDev(
        '<TextInput> is controlled (`value` was provided) but has no `onChange` handler — ' +
          'the input will snap back to the given value.',
      );
    }
  }, [isControlled, onChange]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  // The hint / error ids are always kept, a caller provided description is
  // appended instead of replacing them.
  const describedBy = [hint ? hintId : null, error ? errorId : null, ariaDescribedByProp ?? null]
    .filter(Boolean)
    .join(' ');

  const classNames = [
    'aicl-text-input',
    error ? 'aicl-text-input--error' : '',
    disabled ? 'aicl-text-input--disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} style={style} data-error={error ? 'true' : undefined}>
      {label ? (
        <label className="aicl-text-input__label" htmlFor={inputId}>
          {label}
          {required ? (
            <span className="aicl-text-input__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className="aicl-text-input__control"
        type={type}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : ariaInvalidProp}
        aria-describedby={describedBy === '' ? undefined : describedBy}
        {...rest}
      />
      {hint ? (
        <p className="aicl-text-input__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="aicl-text-input__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
