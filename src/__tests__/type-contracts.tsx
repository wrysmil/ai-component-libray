/**
 * Compile time contracts of the public API.
 *
 * This file contains no runtime test — it is checked by `tsc --noEmit`
 * (`npm run typecheck`). A wrong type therefore breaks the build instead of
 * slipping through the unit tests.
 */

import { DataTable } from '../components/data-table/data-table.js';
import type { DataTableColumn, DataTableProps } from '../components/data-table/types.js';
import type { SelectProps } from '../components/select/types.js';

/** A row modelled with an `interface` — it has no index signature. */
interface Project {
  id: string;
  name: string;
  status: 'active' | 'done';
}

export const projectColumns: DataTableColumn<Project>[] = [
  { key: 'name', title: '名称', sortable: true },
  {
    key: 'status',
    title: '状态',
    // The row is typed, `row.status` is a union — no `String(row.status)` needed.
    render: (row) => row.status.toUpperCase(),
  },
];

export const projectRows: Project[] = [
  { id: '1', name: '数据看板', status: 'active' },
  { id: '2', name: '登录页改版', status: 'done' },
];

export const projectProps: DataTableProps<Project> = {
  columns: projectColumns,
  rows: projectRows,
};

/** The component accepts the typed rows without a cast. */
export const projectTable = <DataTable columns={projectColumns} rows={projectRows} />;

/**
 * The default row type stays strict: an `interface` (a type without an index
 * signature) is **not** assignable to it. The guard fails the build when the
 * default becomes permissive again.
 */
// @ts-expect-error — an `interface` row is not assignable to `DataTableRow`
export const defaultRowsAreStrict: DataTableProps = { columns: [], rows: projectRows };

/**
 * `multiple` must not be part of the native select attributes any more: the
 * component is a single value select, the native attribute would break the
 * controlled `value` / `onChange` contract.
 */
type MultipleIsNotSupported = 'multiple' extends keyof SelectProps ? never : true;
export const multipleIsNotSupported: MultipleIsNotSupported = true;
