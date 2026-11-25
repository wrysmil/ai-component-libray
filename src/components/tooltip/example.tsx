import { Tooltip } from './tooltip.js';
import type { TooltipProps } from './types.js';

/**
 * Minimal runnable example of the Tooltip component.
 */
export function TooltipExample(props: TooltipProps) {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <Tooltip content="这是一个顶部提示">
        <button type="button">悬停或聚焦</button>
      </Tooltip>

      <Tooltip content="底部提示" placement="bottom" delay={0}>
        <button type="button">bottom</button>
      </Tooltip>

      <Tooltip content="左侧提示" placement="left">
        <button type="button">left</button>
      </Tooltip>

      <Tooltip content="右侧提示" placement="right">
        <button type="button">right</button>
      </Tooltip>

      <Tooltip content="这个提示被禁用了" disabled>
        <button type="button">disabled</button>
      </Tooltip>

      <Tooltip {...props}>
        <button type="button">Spread props</button>
      </Tooltip>
    </div>
  );
}

export default TooltipExample;
