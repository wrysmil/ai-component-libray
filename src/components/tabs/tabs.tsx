import { forwardRef, useState } from 'react';

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

  const handleSelect = (id: string) => {
    if (!isControlled) {
      setInternalValue(id);
    }
    onChange?.(id);
  };

  const classNames = [
    'aicl-tabs',
    `aicl-tabs--${variant}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div ref={ref} className={classNames} data-variant={variant} {...rest}>
      <div className="aicl-tabs__list" role="tablist">
        {tabs.map((tab) => {
          const isSelected = tab.id === activeId;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`aicl-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`aicl-tabpanel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={tab.disabled}
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
      {activeTab && activeTab.content !== undefined ? (
        <div
          className="aicl-tabs__panel"
          role="tabpanel"
          id={`aicl-tabpanel-${activeTab.id}`}
          aria-labelledby={`aicl-tab-${activeTab.id}`}
        >
          {activeTab.content}
        </div>
      ) : null}
    </div>
  );
});
