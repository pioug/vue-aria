import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { Key } from "@vue-aria/types";
import type { TableColumn, TableRowNode, UseTableStateResult } from "@vue-aria/table-state";
import { useTableCell } from "@vue-aria/table";

export interface UseGridCellOptions<T = unknown> {
  row: TableRowNode<T>;
  column: TableColumn;
  columnIndex: number;
  colSpan?: MaybeReactive<number | undefined>;
  onAction?: () => void;
  onCellAction?: (rowKey: Key, columnKey: Key) => void;
}

export interface UseGridCellResult {
  gridCellProps: ReadonlyRef<Record<string, unknown>>;
  isPressed: ReadonlyRef<boolean>;
}

export function useGridCell<T>(
  options: UseGridCellOptions<T>,
  state: UseTableStateResult<T>,
  cellRef: MaybeReactive<HTMLElement | null | undefined>
): UseGridCellResult {
  return useTableCell(
    {
      row: options.row,
      column: options.column,
      columnIndex: options.columnIndex,
      colSpan: options.colSpan,
      onAction: () => {
        options.onAction?.();
        options.onCellAction?.(options.row.key, options.column.key);
      },
    },
    state,
    cellRef
  );
}
