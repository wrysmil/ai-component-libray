import { EmptyState } from './empty-state.js';
import type { EmptyStateProps } from './types.js';

/**
 * Minimal runnable example of the EmptyState component.
 */
export function EmptyStateExample(props: EmptyStateProps) {
  const heading: string | undefined = props.title;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      <EmptyState
        title="暂无数据"
        description="创建第一条记录后，这里会展示你的内容。"
        icon={<span aria-hidden="true">📭</span>}
        action={
          <button type="button" onClick={() => console.log('create')}>
            新建记录
          </button>
        }
      />
      <EmptyState
        title="没有搜索结果"
        description="换个关键词试试。"
        size="sm"
      />
      <EmptyState {...props} title={heading ?? '暂无数据'} />
    </div>
  );
}

export default EmptyStateExample;
