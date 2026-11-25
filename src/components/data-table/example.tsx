import { useState } from 'react';

import { DataTable } from './data-table.js';
import type { DataTableColumn, DataTableProps, DataTableRow } from './types.js';

const sampleColumns: DataTableColumn<DataTableRow>[] = [
  { key: 'name', title: '名称', sortable: true },
  { key: 'owner', title: '负责人' },
  { key: 'status', title: '状态', sortable: true },
  { key: 'updatedAt', title: '更新时间', sortable: true, width: '160px' },
];

const sampleRows: DataTableRow[] = [
  { name: '登录页改版', owner: '张敏', status: '进行中', updatedAt: '2024-06-18' },
  { name: '支付流程梳理', owner: '李雷', status: '已完成', updatedAt: '2024-06-11' },
  { name: '数据看板', owner: '王芳', status: '待启动', updatedAt: '2024-05-30' },
];

/**
 * Minimal runnable example of the DataTable component.
 */
export function DataTableExample(props: DataTableProps) {
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <DataTable columns={sampleColumns} rows={sampleRows} pageSize={2} />

      <DataTable
        columns={sampleColumns}
        rows={sampleRows}
        sortBy={sortBy}
        onSortChange={(key) => setSortBy(key)}
      />

      <DataTable columns={sampleColumns} rows={[]} emptyText="这里还没有数据" />

      <DataTable columns={sampleColumns} rows={sampleRows} loading />

      <DataTable {...props} />
    </div>
  );
}

export default DataTableExample;
