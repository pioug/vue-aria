# @vue-aria/grid

`@vue-aria/grid` ports upstream `@react-aria/grid` accessibility hooks for grid semantics and keyboard/selection interaction.

## Implemented modules

- `useGrid`
- `useGridRowGroup`
- `useGridRow`
- `GridKeyboardDelegate`
- `useHighlightSelectionDescription`
- `useGridSelectionAnnouncement`
- `useGridSelectionCheckbox`

## In progress

- `useGridCell`

## Upstream-aligned example (implemented slice)

```ts
import { useGrid, useGridRow, useGridRowGroup } from "@vue-aria/grid";

const state = {} as any;
const gridRef = { current: document.createElement("div") as HTMLElement | null };
const rowRef = { current: document.createElement("div") as HTMLElement | null };

const { gridProps } = useGrid({ "aria-label": "Example grid" }, state, gridRef);
const { rowGroupProps } = useGridRowGroup();
const { rowProps } = useGridRow(
  {
    node: { key: "row-1", index: 0 } as any,
  },
  state,
  rowRef
);
```

## Notes

- Current package status is partial; API parity is in progress.
- `Spectrum S2` is out of scope unless explicitly requested.
