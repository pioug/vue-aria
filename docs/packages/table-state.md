# @vue-aria/table-state

`@vue-aria/table-state` ports upstream `@react-stately/table` state and layout utilities for table collections and column sizing.

## Implemented modules

- `TableCollection`
- `buildHeaderRows`
- `useTableState`
- `useTableColumnResizeState`
- `UNSTABLE_useFilteredTableState`
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
- Treegrid hook (`UNSTABLE_useTreeGridState`)

## Upstream-aligned example (implemented slice)

```ts
import {
  TableCollection,
  TableColumnLayout,
  useTableState,
  useTableColumnResizeState,
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

const widths = layout.buildColumnWidths(
  960,
  resizeState.tableState.collection,
  new Map()
);
```

## Notes

- Current package status is partial; collection/state hooks are still being ported.
- `Spectrum S2` is out of scope unless explicitly requested.
