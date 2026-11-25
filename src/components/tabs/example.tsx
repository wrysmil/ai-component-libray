import { useState } from 'react';

import { Tabs } from './tabs.js';
import type { TabItem, TabsProps } from './types.js';

const defaultTabs: TabItem[] = [
  { id: 'overview', label: '概览', content: '这里是概览内容。' },
  { id: 'activity', label: '动态', content: '这里是动态内容。' },
  { id: 'settings', label: '设置', content: '这里是设置内容。' },
  { id: 'archived', label: '归档', disabled: true, content: '这里是归档内容。' },
];

/**
 * Minimal runnable example of the Tabs component.
 */
export function TabsExample(props: TabsProps) {
  const [value, setValue] = useState('overview');
  const items: TabItem[] | undefined = props.tabs;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <Tabs
        tabs={defaultTabs}
        variant="line"
        value={value}
        onChange={(id) => setValue(id)}
      />
      <Tabs tabs={defaultTabs} variant="pill" defaultValue="activity" />
      <Tabs {...props} tabs={items ?? defaultTabs} />
    </div>
  );
}

export default TabsExample;
