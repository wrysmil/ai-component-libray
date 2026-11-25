import type { HTMLAttributes, ReactNode } from 'react';

/** 一行数据，键与列的 `key` 对应。 */
export type DataTableRow = Record<string, unknown>;

/** 单列的列定义。 */
export interface DataTableColumn<Row extends DataTableRow> {
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

export interface DataTableProps extends HTMLAttributes<HTMLDivElement> {
  /** 列定义。 */
  columns: DataTableColumn<DataTableRow>[];
  /** 行数据（当前页数据）。 */
  rows: DataTableRow[];
  /** 受控排序列 key。 */
  sortBy?: string;
  /** 默认排序列 key（非受控时生效）。 */
  defaultSortBy?: string;
  /** 点击可排序表头时回调新的列 key。 */
  onSortChange?: (key: string) => void;
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
