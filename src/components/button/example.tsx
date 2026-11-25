import { useState } from 'react';

import { Button } from './button.js';
import type { ButtonProps } from './types.js';

/**
 * Minimal runnable example of the Button component.
 */
export function ButtonExample(props: ButtonProps) {
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button onClick={() => setCount((value) => value + 1)}>Clicked {count} times</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button size="small">Small</Button>
      <Button size="large">Large</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button leftIcon={<span aria-hidden="true">+</span>}>With icon</Button>
      <Button {...props}>Spread props</Button>
    </div>
  );
}

export default ButtonExample;
