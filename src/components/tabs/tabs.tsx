import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { warnDev } from '../../core/warn.js';
import type { TabsProps } from './types.js';

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    tabs,
    value,
    defaultValue,
    onChange,
    variant = 'line',
    className,
    ...rest
  },
  ref,
) {
  const fallbackValue = defaultValue ?? tabs[0]?.id ?? '';
  const [internalValue, setInternalValue] = useState<string>(fallbackValue);
  const isControlled = value !== undefined;
  const activeId = isControlled ? value : internalValue;

  // The ids are prefixed with a per instance id: two Tabs on the same page
  // must not share `id` / `aria-controls` / `aria-labelledby` values.
  const uid = useId().replace(/:/g, '');
  const tabId = useCallback((id: string) => `aicl-tabs-${uid}-tab-${id}`, [uid]);
  const panelId = useCallback((id: string) => `aicl-tabs-${uid}-panel-${id}`, [uid]);

  const buttonRefs = useRef(new Map<string, HTMLButtonElement | null>());

  useEffect(() => {
    if (isControlled && !onChange) {
      warnDev(
        '<Tabs> is controlled (`value` was provided) but has no `onChange` handler — ' +
          'the selected tab cannot change.',
      );
    }
  }, [isControlled, onChange]);

  const handleSelect = (id: string) => {
    if (!isControlled) {
      setInternalValue(id);
    }
    onChange?.(id);
  };

  /**
   * Roving tabindex: only the selected tab is reachable with `Tab`, the other
   * ones are reached with the arrow keys (WAI-ARIA tabs pattern).
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = tabs.filter((tab) => !tab.disabled);
    if (enabled.length === 0) return;

    const currentIndex = enabled.findIndex((tab) => tab.id === activeId);
    let nextIndex: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % enabled.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabled.length - 1;
        break;
      default:
        return;
    }

    const next = enabled[nextIndex];
    if (!next) return;
    event.preventDefault();
    handleSelect(next.id);
    buttonRefs.current.get(next.id)?.focus();
  };

  const classNames = [
    'aicl-tabs',
    `aicl-tabs--${variant}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classNames} data-variant={variant} {...rest}>
      <div className="aicl-tabs__list" role="tablist" onKeyDown={handleKeyDown}>
        {tabs.map((tab) => {
          const isSelected = tab.id === activeId;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              aria-selected={isSelected}
              aria-controls={tab.content !== undefined ? panelId(tab.id) : undefined}
              tabIndex={isSelected ? 0 : -1}
              disabled={tab.disabled}
              ref={(node) => {
                buttonRefs.current.set(tab.id, node);
              }}
              className={[
                'aicl-tabs__tab',
                isSelected ? 'aicl-tabs__tab--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (!tab.disabled) {
                  handleSelect(tab.id);
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        if (tab.content === undefined) return null;
        return (
          <div
            key={tab.id}
            className="aicl-tabs__panel"
            role="tabpanel"
            id={panelId(tab.id)}
            aria-labelledby={tabId(tab.id)}
            hidden={!isActive}
            data-active={isActive ? 'true' : undefined}
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
});
