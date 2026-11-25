import { IconButton } from './icon-button.js';
import type { IconButtonProps } from './types.js';

/**
 * Minimal runnable example of the IconButton component.
 */
export function IconButtonExample(props: IconButtonProps) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <IconButton icon={<span aria-hidden="true">+</span>} label="新建" />
      <IconButton icon={<span aria-hidden="true">★</span>} label="收藏" variant="solid" />
      <IconButton icon={<span aria-hidden="true">✎</span>} label="编辑" variant="outline" />
      <IconButton icon={<span aria-hidden="true">⌫</span>} label="删除" size="small" />
      <IconButton icon={<span aria-hidden="true">⤢</span>} label="全屏" size="large" />
      <IconButton icon={<span aria-hidden="true">×</span>} label="关闭" disabled />
      <IconButton {...props} />
    </div>
  );
}

export default IconButtonExample;
