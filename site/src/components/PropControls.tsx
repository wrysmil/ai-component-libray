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
  /**
   * Incremented on every reset — the controls use it to drop invalid drafts.
   */
  resetKey?: number;
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
 * Function props (`onChange`, `onClose`, ...) are wired by the preview
 * registry, they cannot be edited as JSON — therefore they get no control.
 */
function isFunctionProp(prop: PropMeta): boolean {
  return prop.type.includes('=>');
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
  resetKey = 0,
}: {
  name: string;
  description: string;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  resetKey?: number;
}) {
  const [draft, setDraft] = useState(() => stringifyValue(value));
  const [error, setError] = useState<string | null>(null);
  const lastValue = useRef<unknown>(value);
  const lastResetKey = useRef(resetKey);

  useEffect(() => {
    if (!Object.is(lastValue.current, value)) {
      lastValue.current = value;
      setDraft(stringifyValue(value));
      setError(null);
    }
  }, [value]);

  // A reset drops the draft as well — otherwise an invalid JSON draft (and
  // its error message) survives the reset.
  useEffect(() => {
    if (lastResetKey.current === resetKey) return;
    lastResetKey.current = resetKey;
    lastValue.current = value;
    setDraft(stringifyValue(value));
    setError(null);
  }, [resetKey, value]);

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
export function PropControls({
  props,
  values,
  onChange,
  onReset,
  resetKey = 0,
}: PropControlsProps) {
  const editable = props.filter((prop) => !isFunctionProp(prop));

  return (
    <div className="controls">
      {editable.length === 0 ? (
        <p className="controls__empty">This component does not expose any props.</p>
      ) : null}
      {editable.map((prop) => {
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
                  if (raw === '') {
                    onChange(prop.name, undefined);
                    return;
                  }
                  const parsed = Number(raw);
                  // A value that is not a number is never written back, the
                  // preview would show `NaN`.
                  if (!Number.isFinite(parsed)) return;
                  onChange(prop.name, parsed);
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
              resetKey={resetKey}
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
