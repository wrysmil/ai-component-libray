import { useState } from 'react';

import { Checkbox } from './checkbox.js';
import type { CheckboxProps } from './types.js';

/**
 * Minimal runnable example of the Checkbox component.
 */
export function CheckboxExample(props: CheckboxProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox label="我已阅读并同意服务条款" checked={accepted} onChange={setAccepted} />
      <Checkbox label="默认勾选" defaultChecked />
      <Checkbox label="半选状态" indeterminate />
      <Checkbox label="禁用且未勾选" disabled />
      <Checkbox label="禁用且已勾选" defaultChecked disabled />
      <Checkbox name="newsletter" value="yes" label="订阅新闻邮件" />
      <Checkbox {...props} />
    </div>
  );
}

export default CheckboxExample;
