import { forwardRef, useEffect, useMemo, useState } from 'react';
import type { ForwardedRef, ForwardRefRenderFunction, ReactElement, ReactNode } from 'react';

import type { DataTableColumn, DataTableProps, DataTableRow, SortDirection } from './types.js';

/** Compare two cell values in a stable, locale aware way. */
function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), 'zh-CN');
}

/** Read a cell of a row without requiring an index signature. */
function cellValue(row: object, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

/** Turn an arbitrary cell value into something React is able to render. */
function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function DataTableInner<Row extends object = DataTableRow>(
  {
    columns,
    rows,
    rowKey,
    sortBy,
    defaultSortBy,
    sortDirection,
    defaultSortDirection = 'ascending',
    onSortChange,
    pageSize = 10,
    emptyText = '暂无数据',
    loading = false,
    className,
    ...rest
  }: DataTableProps<Row>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [internalSortBy, setInternalSortBy] = useState<string | undefined>(defaultSortBy);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(
    defaultSortDirection,
  );
  const [page, setPage] = useState(0);

  const activeSortBy = sortBy ?? internalSortBy;
  const activeSortDirection = sortDirection ?? internalSortDirection;

  const sortedRows = useMemo(() => {
    if (!activeSortBy) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const result = compareValues(cellValue(a, activeSortBy), cellValue(b, activeSortBy));
      return activeSortDirection === 'descending' ? -result : result;
    });
    return copy;
  }, [rows, activeSortBy, activeSortDirection]);

  const size = pageSize > 0 ? Math.floor(pageSize) : 10;
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / size));
  const currentPage = Math.min(Math.max(page, 0), totalPages - 1);
  const pageRows = sortedRows.slice(currentPage * size, currentPage * size + size);
  const columnCount = Math.max(columns.length, 1);

  // Keep the internal page in sync when the data set shrinks.
  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const handleSort = (column: DataTableColumn<Row>) => {
    if (!column.sortable) return;
    const isSameColumn = column.key === activeSortBy;
    const nextDirection: SortDirection =
      isSameColumn && activeSortDirection === 'ascending' ? 'descending' : 'ascending';
    setInternalSortBy(column.key);
    setInternalSortDirection(nextDirection);
    onSortChange?.(column.key, nextDirection);
  };

  const resolveRowKey = (row: Row, index: number): string => {
    if (rowKey) return rowKey(row, index);
    const id = cellValue(row, 'id');
    if (typeof id === 'string' || typeof id === 'number') return String(id);
    return `row-${index}`;
  };

  const classNames = ['aicl-data-table', className ?? ''].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classNames} {...rest}>
      <div className="aicl-data-table__scroller">
        <table className="aicl-data-table__table">
          <thead className="aicl-data-table__head">
            <tr className="aicl-data-table__row">
              {columns.map((column) => {
                const isSorted = column.key === activeSortBy;
                const ariaSort = column.sortable
                  ? isSorted
                    ? activeSortDirection
                    : 'none'
                  : undefined;
                return (
                  <th
                    key={column.key}
                    className="aicl-data-table__header-cell"
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                    aria-sort={ariaSort}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="aicl-data-table__sort-button"
                        onClick={() => handleSort(column)}
                      >
                        <span className="aicl-data-table__sort-label">{column.title}</span>
                        <span
                          className="aicl-data-table__sort-indicator"
                          aria-hidden="true"
                          data-state={isSorted ? 'sorted' : 'idle'}
                        >
                          {isSorted
                            ? activeSortDirection === 'descending'
                              ? '▼'
                              : '▲'
                            : '⇅'}
                        </span>
                      </button>
                    ) : (
                      <span className="aicl-data-table__sort-label">{column.title}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="aicl-data-table__body">
            {loading ? (
              <tr className="aicl-data-table__row">
                <td className="aicl-data-table__state" colSpan={columnCount}>
                  加载中…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="aicl-data-table__row">
                <td className="aicl-data-table__state" colSpan={columnCount}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageRows.map((row, index) => {
                const globalIndex = currentPage * size + index;
                return (
                  <tr key={resolveRowKey(row, globalIndex)} className="aicl-data-table__row">
                    {columns.map((column) => (
                      <td key={column.key} className="aicl-data-table__cell">
                        {column.render
                          ? column.render(row, globalIndex)
                          : renderValue(cellValue(row, column.key))}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="aicl-data-table__pager">
          <button
            type="button"
            className="aicl-data-table__pager-button"
            onClick={() => setPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            aria-label="上一页"
          >
            上一页
          </button>
          <span className="aicl-data-table__pager-indicator" aria-live="polite">
            第 {currentPage + 1} / {totalPages} 页
          </span>
          <button
            type="button"
            className="aicl-data-table__pager-button"
            onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            aria-label="下一页"
          >
            下一页
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The table is generic over the row shape: `DataTable<Project>` gives the
 * `render` callbacks and the `rows` prop the precise type of the consumer.
 */
export const DataTable = forwardRef(
  DataTableInner as ForwardRefRenderFunction<HTMLDivElement, DataTableProps>,
) as unknown as <Row extends object = DataTableRow>(
  props: DataTableProps<Row> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;
