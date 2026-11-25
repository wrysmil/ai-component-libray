import { Card } from './card.js';
import type { CardProps } from './types.js';

/**
 * Minimal runnable example of the Card component.
 */
export function CardExample(props: CardProps) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
      <Card
        title="默认卡片"
        description="带标题与描述的通用容器。"
        footer={<span style={{ fontSize: 13 }}>底部操作区</span>}
      >
        <p>卡片主体内容，children 会渲染在卡片主体区域。</p>
      </Card>

      <Card variant="outlined" padding="sm" title="描边卡片">
        <p>更紧凑的内边距，适合放在列表中。</p>
      </Card>

      <Card variant="elevated" padding="lg" title="浮起卡片">
        <p>带有阴影的强调卡片。</p>
      </Card>

      <Card padding="none" title="无内边距">
        <p>padding="none" 时内容紧贴边缘。</p>
      </Card>

      <Card {...props}>Spread props</Card>
    </div>
  );
}

export default CardExample;
