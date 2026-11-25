import { Progress } from './progress.js';
import type { ProgressProps } from './types.js';

/**
 * Minimal runnable example of the Progress component.
 */
export function ProgressExample(props: ProgressProps) {
  const current: number | undefined = props.value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      <Progress value={30} showLabel />
      <Progress value={64} max={128} showLabel />
      <Progress value={80} label="上传中" />
      <Progress value={45} variant="circular" showLabel />
      <Progress value={45} variant="circular" label="处理中" />
      <Progress {...props} value={current ?? 0} />
    </div>
  );
}

export default ProgressExample;
