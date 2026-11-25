import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import type { CheckboxProps } from './types.js';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    checked,
    defaultChecked = false,
    onChange,
    indeterminate = false,
    disabled = false,
    name,
    value = 'on',
    className,
    style,
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId().replace(/:/g, '');
  const inputId = id ?? `aicl-checkbox-${generatedId}`;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextChecked = event.target.checked;
    if (!isControlled) {
      setInternalChecked(nextChecked);
    }
    onChange?.(nextChecked);
  };

  const classNames = [
    'aicl-checkbox',
    currentChecked ? 'aicl-checkbox--checked' : '',
    indeterminate ? 'aicl-checkbox--indeterminate' : '',
    disabled ? 'aicl-checkbox--disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} style={style}>
      <input
        ref={setRefs}
        id={inputId}
        className="aicl-checkbox__control"
        type="checkbox"
        checked={currentChecked}
        onChange={handleChange}
        disabled={disabled}
        name={name}
        value={value}
        aria-checked={indeterminate ? 'mixed' : undefined}
        {...rest}
      />
      {label ? (
        <label className="aicl-checkbox__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
    </div>
  );
});
