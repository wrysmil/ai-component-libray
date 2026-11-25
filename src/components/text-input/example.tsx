import { useState } from 'react';

import { TextInput } from './text-input.js';
import type { TextInputProps } from './types.js';

/**
 * Minimal runnable example of the TextInput component.
 */
export function TextInputExample(props: TextInputProps) {
  const [name, setName] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <TextInput
        label="姓名"
        placeholder="请输入姓名"
        value={name}
        onChange={setName}
        hint="支持中英文，最多 20 个字符"
      />
      <TextInput label="邮箱" type="email" defaultValue="hello@example.com" required />
      <TextInput label="关键词" type="search" placeholder="搜索…" />
      <TextInput label="密码" type="password" error="密码至少需要 8 位" />
      <TextInput label="禁用状态" defaultValue="不可编辑" disabled />
      <TextInput {...props} />
    </div>
  );
}

export default TextInputExample;
