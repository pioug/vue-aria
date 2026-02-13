import type { GridRowProps } from "@vue-aria/grid";
import { tableNestedRows } from "@vue-aria/flags";
import type { TableState } from "@vue-aria/table-state";

export interface TableHeaderRowAria {
  rowProps: Record<string, unknown>;
}

export function useTableHeaderRow<T>(
  props: GridRowProps<T>,
  state: TableState<T>,
  _ref: { current: Element | null }
): TableHeaderRowAria {
  const { node, isVirtualized } = props;
  const rowProps: Record<string, unknown> = {
    role: "row",
  };

  if (isVirtualized && !(tableNestedRows() && "expandedKeys" in (state as any))) {
    rowProps["aria-rowindex"] = node.index + 1;
  }

  return {
    rowProps,
  };
}
