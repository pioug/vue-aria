# @vue-aria/grid

Grid accessibility adapters built on top of table state primitives.

## `useGrid`

Provides grid semantics, keyboard navigation, and row action wiring.

## `useGridCell`

Provides grid cell semantics and forwards cell action callbacks.

```ts
import { useGrid, useGridCell } from "@vue-aria/grid";
import { useTableState } from "@vue-aria/table-state";

const state = useTableState({
  columns: [{ key: "name", isRowHeader: true }, { key: "type" }],
  collection: [{ key: 1, cells: [{ textValue: "Charizard" }, { textValue: "Fire" }] }],
});

const { gridProps } = useGrid({ "aria-label": "Pokemon" }, state, gridRef);
const row = state.collection.value.rows[0];
const { gridCellProps } = useGridCell(
  {
    row,
    column: state.collection.value.columns[1],
    columnIndex: 1,
  },
  state,
  cellRef
);
```
