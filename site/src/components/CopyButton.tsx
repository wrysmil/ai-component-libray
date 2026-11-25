import { useEffect, useState } from 'react';

export type CopyState = 'idle' | 'copied' | 'error';

/**
 * Copy `text` to the clipboard.
 *
 * The modern `navigator.clipboard` API is used when available; otherwise the
 * content is copied through a hidden `<textarea>` and
 * `document.execCommand('copy')` (jsdom has no clipboard implementation, and
 * older browsers / insecure contexts do not expose it either).
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall back to the textarea based copy below */
  }
  return copyWithTextarea(text);
}

/** Legacy copy strategy: hidden textarea + `document.execCommand('copy')`. */
export function copyWithTextarea(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.left = '-1000px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  try {
    textarea.select();
    if (typeof textarea.setSelectionRange === 'function') {
      textarea.setSelectionRange(0, textarea.value.length);
    }
    if (typeof document.execCommand !== 'function') return false;
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export interface CopyButtonProps {
  /** The text that is written to the clipboard. */
  value: string;
  /** The visible label of the button. */
  label: string;
  /** Optional accessible description. */
  description?: string;
  /** Additional class name. */
  className?: string;
}

/** A button that copies a piece of text to the clipboard. */
export function CopyButton({ value, label, description, className }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');

  useEffect(() => {
    if (state === 'idle') return undefined;
    const timer = window.setTimeout(() => setState('idle'), 1600);
    return () => window.clearTimeout(timer);
  }, [state]);

  const handleClick = () => {
    void copyText(value).then((ok) => setState(ok ? 'copied' : 'error'));
  };

  const text = state === 'copied' ? 'Copied!' : state === 'error' ? 'Copy failed' : label;

  return (
    <button
      type="button"
      className={['button', 'button--ghost', className ?? ''].filter(Boolean).join(' ')}
      onClick={handleClick}
      title={description ?? label}
      data-state={state}
    >
      {text}
    </button>
  );
}

export default CopyButton;
