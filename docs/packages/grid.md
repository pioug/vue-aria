# @vue-aria/grid

`@vue-aria/grid` ports upstream `@react-aria/grid` accessibility hooks for grid semantics and keyboard/selection interaction.

## Implemented modules

- `useGridRowGroup`
- `useGridRow`

## In progress

- `useGrid`
- `useGridCell`
- `GridKeyboardDelegate`
- Selection-announcement and selection-checkbox helpers

## Upstream-aligned example (implemented slice)

```ts
import { useGridRow, useGridRowGroup } from "@vue-aria/grid";

const state = {} as any;
const rowRef = { current: document.createElement("div") as HTMLElement | null };

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
