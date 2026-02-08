# @vue-aria/table

Table accessibility primitives for grid-style tables.

## `useTable`

Provides table/grid semantics, row keyboard navigation, typeahead, and row action wiring.

## `useTableRow`

Provides row semantics, selection behavior, focus behavior, and row action handling.

## `useTableCell`

Provides cell semantics, including row header role mapping for row-header columns.

## `useTableColumnHeader`

Provides column header semantics and sortable header behavior (`aria-sort` + sort interaction).

```ts
import {
  useTable,
  useTableRow,
  useTableCell,
  useTableColumnHeader,
} from "@vue-aria/table";
import { useTableState } from "@vue-aria/table-state";

const state = useTableState({
  columns: [
    { key: "name", isRowHeader: true },
    { key: "type", allowsSorting: true },
  ],
  collection: [{ key: 1, cells: [{ textValue: "Charizard" }, { textValue: "Fire" }] }],
  selectionMode: "multiple",
});

const { gridProps } = useTable({ "aria-label": "Pokemon" }, state, tableRef);
const row = state.collection.value.rows[0];
const rowHook = useTableRow({ row, rowIndex: 0 }, state, rowRef);
const cellHook = useTableCell(
  {
    row,
    column: state.collection.value.columns[0],
    columnIndex: 0,
  },
  state,
  cellRef
);
const headerHook = useTableColumnHeader(
  {
    column: state.collection.value.columns[1],
    columnIndex: 1,
  },
  state,
  headerRef
);
```
