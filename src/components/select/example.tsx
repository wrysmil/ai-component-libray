import { useState } from 'react';

import { Select } from './select.js';
import type { SelectOption, SelectProps } from './types.js';

const options: SelectOption[] = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '樱桃', value: 'cherry', disabled: true },
];

/**
 * Minimal runnable example of the Select component.
 */
export function SelectExample(props: SelectProps) {
  const [value, setValue] = useState('apple');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
      <Select
        label="水果"
        options={options}
        value={value}
        onChange={setValue}
        placeholder="请选择水果"
      />
      <Select label="默认值" options={options} defaultValue="banana" />
      <Select label="小尺寸" options={options} size="small" />
      <Select label="大尺寸" options={options} size="large" />
      <Select label="禁用" options={options} disabled />
      <Select {...props} options={props.options ?? options} />
    </div>
  );
}

export default SelectExample;
