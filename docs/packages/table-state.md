# @vue-aria/table-state

`@vue-aria/table-state` ports upstream `@react-stately/table` state and layout utilities for table collections and column sizing.

## Implemented modules

- `TableColumnLayout`
- Table sizing utilities from `TableUtils`:
  - `calculateColumnSizes`
  - `isStatic`
  - `parseFractionalUnit`
  - `parseStaticWidth`
  - `getMinWidth`
  - `getMaxWidth`

## In progress

- Table collection builder/state modules (`TableCollection`, `useTableState`, `useTableColumnResizeState`, `useTreeGridState`)

## Upstream-aligned example (implemented slice)

```ts
import { TableColumnLayout } from "@vue-aria/table-state";

const layout = new TableColumnLayout({
  getDefaultWidth: () => "1fr",
  getDefaultMinWidth: () => 75,
});

const widths = layout.buildColumnWidths(
  960,
  {
    columns: [
      { key: "name", props: { width: "2fr" } },
      { key: "status", props: { width: "1fr" } },
    ],
  } as any,
  new Map()
);
```

## Notes

- Current package status is partial; collection/state hooks are still being ported.
- `Spectrum S2` is out of scope unless explicitly requested.
