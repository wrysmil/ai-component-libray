import { useEffect, useRef, useState } from 'react';

import type { PropMeta } from '../../../src/core/types.js';

export interface PropControlsProps {
  /** The props of the component, taken from the manifest. */
  props: PropMeta[];
  /** The current values of the preview. */
  values: Record<string, unknown>;
  /** Called whenever a control changes a value. */
  onChange: (name: string, value: unknown) => void;
  /** Optional "reset" button handler. */
  onReset?: () => void;
}

function stringifyValue(value: unknown): string {
  if (value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2) ?? '';
  } catch {
    return '';
  }
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value === undefined ? '' : String(value);
}

/**
 * A control for props whose value is not a simple string / number / boolean
 * (arrays, objects, React nodes, functions, ...).
 *
 * The control is a `<textarea>` holding JSON. Invalid JSON is reported
 * inline and the last valid value is kept, so the preview never breaks.
 */
function JsonPropControl({
  name,
  description,
  value,
  onChange,
}: {
  name: string;
  description: string;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}) {
  const [draft, setDraft] = useState(() => stringifyValue(value));
  const [error, setError] = useState<string | null>(null);
  const lastValue = useRef<unknown>(value);

  useEffect(() => {
    if (!Object.is(lastValue.current, value)) {
      lastValue.current = value;
      setDraft(stringifyValue(value));
      setError(null);
    }
  }, [value]);

  const handleChange = (text: string) => {
    setDraft(text);
    const trimmed = text.trim();
    if (trimmed === '') {
      setError(null);
      lastValue.current = undefined;
      onChange(name, undefined);
      return;
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      setError(null);
      lastValue.current = parsed;
      onChange(name, parsed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invalid JSON');
    }
  };

  const errorId = `prop-${name}-error`;

  return (
    <>
      <textarea
        id={`prop-${name}`}
        className="control control--textarea"
        value={draft}
        spellCheck={false}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => handleChange(event.target.value)}
      />
      {error ? (
        <p className="control__error" id={errorId} role="alert">
          Invalid JSON: {error} — the last valid value is kept.
        </p>
      ) : (
        <p className="control__hint">{description}</p>
      )}
    </>
  );
}

/**
 * The auto generated control panel of a component.
 *
 * The kind of control is derived from the manifest:
 * a list of options → `<select>`, `boolean` → checkbox, `number` → number
 * input, `string` → text input, everything else → JSON textarea.
 */
export function PropControls({ props, values, onChange, onReset }: PropControlsProps) {
  return (
    <div className="controls">
      {props.length === 0 ? (
        <p className="controls__empty">This component does not expose any props.</p>
      ) : null}
      {props.map((prop) => {
        const value = values[prop.name];
        const id = `prop-${prop.name}`;
        const label = (
          <label className="control__label" htmlFor={id}>
            <code>{prop.name}</code>
            {prop.required ? <span className="control__required">required</span> : null}
            <span className="control__type">{prop.type}</span>
          </label>
        );

        if (prop.options && prop.options.length > 0) {
          return (
            <div className="control" key={prop.name}>
              {label}
              <select
                id={id}
                className="control--select"
                value={asString(value)}
                onChange={(event) => onChange(prop.name, event.target.value)}
              >
                <option value="">— unset —</option>
                {prop.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="control__hint">{prop.description}</p>
            </div>
          );
        }

        if (prop.type === 'boolean') {
          return (
            <div className="control control--inline" key={prop.name}>
              <input
                id={id}
                className="control--checkbox"
                type="checkbox"
                checked={value === true}
                onChange={(event) => onChange(prop.name, event.target.checked)}
              />
              {label}
            </div>
          );
        }

        if (prop.type === 'number') {
          return (
            <div className="control" key={prop.name}>
              {label}
              <input
                id={id}
                className="control--number"
                type="number"
                value={typeof value === 'number' ? String(value) : ''}
                onChange={(event) => {
                  const raw = event.target.value;
                  onChange(prop.name, raw === '' ? undefined : Number(raw));
                }}
              />
              <p className="control__hint">{prop.description}</p>
            </div>
          );
        }

        if (prop.type === 'string') {
          return (
            <div className="control" key={prop.name}>
              {label}
              <input
                id={id}
                className="control--text"
                type="text"
                value={asString(value)}
                onChange={(event) => onChange(prop.name, event.target.value)}
              />
              <p className="control__hint">{prop.description}</p>
            </div>
          );
        }

        return (
          <div className="control" key={prop.name}>
            {label}
            <JsonPropControl
              name={prop.name}
              description={prop.description}
              value={value}
              onChange={onChange}
            />
          </div>
        );
      })}
      {onReset ? (
        <button type="button" className="button button--ghost" onClick={onReset}>
          Reset props
        </button>
      ) : null}
    </div>
  );
}

export default PropControls;
