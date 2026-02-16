# @vue-stately/table

`@vue-stately/table` ports upstream `@react-stately/table` state and layout utilities for table collections and column sizing.

## Implemented modules

- `TableCollection`
- `buildHeaderRows`
- `TableHeader`
- `TableBody`
- `Column`
- `Row`
- `Cell`
- `useTableState`
- `useTableColumnResizeState`
- `UNSTABLE_useFilteredTableState`
- `UNSTABLE_useTreeGridState`
- `TableColumnLayout`
- Table sizing utilities from `TableUtils`:
  - `calculateColumnSizes`
  - `isStatic`
  - `parseFractionalUnit`
  - `parseStaticWidth`
  - `getMinWidth`
  - `getMaxWidth`

## Upstream-aligned example (implemented slice)

```ts
import {
  TableCollection,
  TableColumnLayout,
  useTableState,
  useTableColumnResizeState,
  UNSTABLE_useTreeGridState,
} from "@vue-stately/table";

const layout = new TableColumnLayout({
  getDefaultWidth: () => "1fr",
  getDefaultMinWidth: () => 75,
});

const collection = new TableCollection([] as any);
const state = useTableState({
  collection,
  selectionMode: "single",
});
const resizeState = useTableColumnResizeState({ tableWidth: 960 }, state);
const treeState = UNSTABLE_useTreeGridState({
  children: [] as any,
  selectionMode: "single",
});

const widths = layout.buildColumnWidths(
  960,
  resizeState.tableState.collection,
  new Map()
);
```

## Notes

- Current package status: complete for upstream `@react-stately/table` state/layout module scope.
- `UNSTABLE_useTreeGridState` requires enabling `tableNestedRows` via `enableTableNestedRows()` from `@vue-aria/flags`.
- `Spectrum S2` is out of scope unless explicitly requested.
