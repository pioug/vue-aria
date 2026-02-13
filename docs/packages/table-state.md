# @vue-aria/table-state

`@vue-aria/table-state` ports upstream `@react-stately/table` state and layout utilities for table collections and column sizing.

## Implemented modules

- `TableCollection`
- `buildHeaderRows`
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

## In progress

- Table collection element builders (`TableHeader`, `TableBody`, `Column`, `Row`, `Cell`)

## Upstream-aligned example (implemented slice)

```ts
import {
  TableCollection,
  TableColumnLayout,
  useTableState,
  useTableColumnResizeState,
  UNSTABLE_useTreeGridState,
} from "@vue-aria/table-state";

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

- Current package status is partial; collection/state hooks are still being ported.
- `UNSTABLE_useTreeGridState` requires enabling `tableNestedRows` via `enableTableNestedRows()` from `@vue-aria/flags`.
- `Spectrum S2` is out of scope unless explicitly requested.
