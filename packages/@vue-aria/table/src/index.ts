export { useTable } from "./useTable";
export { useTableColumnHeader } from "./useTableColumnHeader";
export { useTableRow } from "./useTableRow";
export { useTableHeaderRow } from "./useTableHeaderRow";
export { useTableCell } from "./useTableCell";
export {
  useTableSelectionCheckbox,
  useTableSelectAllCheckbox,
} from "./useTableSelectionCheckbox";
export { useTableColumnResize } from "./useTableColumnResize";

import { useGridRowGroup, type GridRowGroupAria } from "@vue-aria/grid";

export function useTableRowGroup(): GridRowGroupAria {
  return useGridRowGroup();
}

export type { AriaTableProps } from "./useTable";
export type { GridAria, GridRowAria, GridRowProps } from "@vue-aria/grid";
export type {
  AriaTableColumnHeaderProps,
  TableColumnHeaderAria,
} from "./useTableColumnHeader";
export type { AriaTableCellProps, TableCellAria } from "./useTableCell";
export type { TableHeaderRowAria } from "./useTableHeaderRow";
export type {
  AriaTableSelectionCheckboxProps,
  TableSelectionCheckboxAria,
  TableSelectAllCheckboxAria,
} from "./useTableSelectionCheckbox";
export type {
  AriaTableColumnResizeProps,
  TableColumnResizeAria,
} from "./useTableColumnResize";
