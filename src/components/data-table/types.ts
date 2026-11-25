import type { HTMLAttributes, ReactNode } from 'react';

/** 一行数据，键与列的 `key` 对应。 */
export type DataTableRow = Record<string, unknown>;

/** 排序方向。 */
export type SortDirection = 'ascending' | 'descending';

/**
 * 单列的列定义。
 *
 * `Row` 描述行数据的形状，默认是宽松的 `DataTableRow`。传入自定义类型时
 * `render` 回调可以拿到精确的字段类型（`interface` 定义的类型同样可用）。
 */
export interface DataTableColumn<Row extends object = DataTableRow> {
  /** 列的唯一键，对应行数据中的字段名。 */
  key: string;
  /** 表头显示文本。 */
  title: string;
  /** 是否可排序。 */
  sortable?: boolean;
  /** 列宽，例如 "120px" 或 "20%"。 */
  width?: string;
  /** 自定义单元格渲染。 */
  render?: (row: Row, index: number) => ReactNode;
}

export interface DataTableProps<Row extends object = DataTableRow>
  extends HTMLAttributes<HTMLDivElement> {
  /** 列定义。 */
  columns: DataTableColumn<Row>[];
  /** 全部行数据，组件内部按 `pageSize` 分页。 */
  rows: Row[];
  /**
   * 行 key 生成器，默认使用 `row.id`（存在时）否则使用行下标。
   * 翻页或排序后 key 保持稳定，React 不会错误地复用行节点。
   */
  rowKey?: (row: Row, index: number) => string;
  /** 受控排序列 key。 */
  sortBy?: string;
  /** 默认排序列 key（非受控时生效）。 */
  defaultSortBy?: string;
  /** 受控排序方向。 */
  sortDirection?: SortDirection;
  /** 默认排序方向（非受控时生效）。 */
  defaultSortDirection?: SortDirection;
  /** 点击可排序表头时回调新的列 key 与排序方向。 */
  onSortChange?: (key: string, direction: SortDirection) => void;
  /**
   * 每页行数。
   * @default 10
   */
  pageSize?: number;
  /**
   * 空数据时的占位文案。
   * @default "暂无数据"
   */
  emptyText?: string;
  /**
   * 加载中状态。
   * @default false
   */
  loading?: boolean;
}
