# @vue-aria/table-state

`@vue-aria/table-state` ports upstream `@react-stately/table` state and layout utilities for table collections and column sizing.

## Implemented modules

- `TableCollection`
- `buildHeaderRows`
- `useTableState`
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
- Resize/treegrid hooks (`useTableColumnResizeState`, `UNSTABLE_useTreeGridState`)

## Upstream-aligned example (implemented slice)

```ts
import { TableCollection, TableColumnLayout, useTableState } from "@vue-aria/table-state";

const layout = new TableColumnLayout({
  getDefaultWidth: () => "1fr",
  getDefaultMinWidth: () => 75,
});

const collection = new TableCollection([] as any);
const state = useTableState({
  collection,
  selectionMode: "single",
});

const widths = layout.buildColumnWidths(
  960,
  state.collection,
  new Map()
);
```

## Notes

- Current package status is partial; collection/state hooks are still being ported.
- `Spectrum S2` is out of scope unless explicitly requested.
