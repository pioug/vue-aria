# @vue-aria/grid

`@vue-aria/grid` ports upstream `@react-aria/grid` accessibility hooks for grid semantics and keyboard/selection interaction.

## Implemented modules

- `useGrid`
- `useGridCell`
- `useGridRowGroup`
- `useGridRow`
- `GridKeyboardDelegate`
- `useHighlightSelectionDescription`
- `useGridSelectionAnnouncement`
- `useGridSelectionCheckbox`

## Parity status

- Upstream hook surface is ported.
- Upstream `useGrid.test.js` focus-mode interaction matrix is adapted in `packages/@vue-aria/grid/test/useGrid.interactions.test.ts`.

## Upstream-aligned example (implemented slice)

```ts
import { useGrid, useGridCell, useGridRow, useGridRowGroup } from "@vue-aria/grid";

const state = {} as any;
const gridRef = { current: document.createElement("div") as HTMLElement | null };
const rowRef = { current: document.createElement("div") as HTMLElement | null };
const cellRef = { current: document.createElement("div") as HTMLElement | null };

const { gridProps } = useGrid({ "aria-label": "Example grid" }, state, gridRef);
const { rowGroupProps } = useGridRowGroup();
const { gridCellProps } = useGridCell(
  {
    node: { key: "cell-1", index: 0, parentKey: "row-1" } as any,
  },
  state,
  cellRef
);
const { rowProps } = useGridRow(
  {
    node: { key: "row-1", index: 0 } as any,
  },
  state,
  rowRef
);
```

## Base markup example

```html
<div v-bind="gridProps" ref="gridRef" class="grid">
  <div v-bind="rowProps" ref="rowRef" class="grid-row">
    <div v-bind="gridCellProps" ref="cellRef" class="grid-cell">
      <button type="button">Action A</button>
      <button type="button">Action B</button>
    </div>
  </div>
</div>
```

```css
.grid {
  border: 1px solid #c7ccd1;
  border-radius: 8px;
  padding: 8px;
}

.grid-row + .grid-row {
  margin-top: 6px;
}

.grid-cell {
  display: flex;
  gap: 8px;
  padding: 8px;
  border: 1px solid #d7dce1;
  border-radius: 6px;
}

.grid-cell:focus-visible,
.grid-row:focus-visible {
  outline: 2px solid #0f62fe;
  outline-offset: 2px;
}
```

## Notes

- Current package status is hook-level parity complete; downstream visual consumers should still validate app-specific styles.
- `Spectrum S2` is out of scope unless explicitly requested.
