import { useGridCell } from "@vue-aria/grid";
import type { GridNode } from "@vue-stately/grid";
import type { TableState } from "@vue-stately/table";
import { getCellId } from "./utils";

export interface AriaTableCellProps {
  node: GridNode<unknown>;
  isVirtualized?: boolean;
  shouldSelectOnPressUp?: boolean;
  onAction?: () => void;
}

export interface TableCellAria {
  gridCellProps: Record<string, unknown>;
  isPressed: boolean;
}

export function useTableCell<T>(
  props: AriaTableCellProps,
  state: TableState<T>,
  ref: { current: HTMLElement | null }
): TableCellAria {
  const { gridCellProps, isPressed } = useGridCell(props as any, state as any, ref);
  const columnKey = props.node.column?.key;
  if (columnKey != null && state.collection.rowHeaderColumnKeys.has(columnKey)) {
    gridCellProps.role = "rowheader";
    gridCellProps.id = getCellId(
      state,
      props.node.parentKey as any,
      columnKey
    );
  }

  return {
    gridCellProps,
    isPressed,
  };
}
