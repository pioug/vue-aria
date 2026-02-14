# @vue-aria/gridlist

`@vue-aria/gridlist` ports upstream `@react-aria/gridlist` accessibility hooks for single-column grid-style list semantics.

## Implemented modules

- `useGridList`
- `useGridListItem`
- `useGridListSection`
- `useGridListSelectionCheckbox`

## Upstream-aligned example

```ts
import { useGridList, useGridListItem, useGridListSelectionCheckbox } from "@vue-aria/gridlist";
import { useListState } from "@vue-aria/list-state";

const listRef = { current: null as HTMLElement | null };
const rowRef = { current: null as HTMLElement | null };

const state = useListState({
  selectionMode: "multiple",
  items: [
    { id: "a", label: "Item A" },
    { id: "b", label: "Item B" },
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label,
});

const { gridProps } = useGridList({ "aria-label": "Example grid list" }, state, listRef);
const node = state.collection.getItem("a")!;
const { rowProps, gridCellProps } = useGridListItem({ node }, state, rowRef);
const { checkboxProps } = useGridListSelectionCheckbox({ key: "a" }, state);
```

## Base markup example

```html
<div v-bind="gridProps" ref="listRef" class="gridlist">
  <div v-bind="rowProps" ref="rowRef" class="gridlist-row">
    <div v-bind="gridCellProps" class="gridlist-cell">
      <input type="checkbox" v-bind="checkboxProps" />
      <span>Item A</span>
    </div>
  </div>
</div>
```

```css
.gridlist {
  border: 1px solid #ccd3da;
  border-radius: 8px;
  padding: 6px;
}

.gridlist-row + .gridlist-row {
  margin-top: 4px;
}

.gridlist-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
}

.gridlist-row:focus-visible {
  outline: 2px solid #0f62fe;
  outline-offset: 2px;
}
```

## Notes

- Pair `useGridList` with either `useListState` or `useTreeState` depending on list vs tree data.
- `Spectrum S2` is out of scope unless explicitly requested.
