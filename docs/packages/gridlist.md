# @vue-aria/gridlist

`@vue-aria/gridlist` ports upstream `@react-aria/gridlist` accessibility hooks for single-column grid-style list semantics.

## Implemented modules

- `useGridList`
- `useGridListItem`
- `useGridListSection`
- `useGridListSelectionCheckbox`

## Feature coverage

- Item selection via `selectionMode` and `selectionBehavior`
- Interactive children in rows (buttons, checkboxes, menus, etc.)
- Row actions and row selection coexistence
- Arrow-key child navigation (`keyboardNavigationBehavior="arrow"`)
- Optional tab-key child navigation (`keyboardNavigationBehavior="tab"`)
- Accessible row-level checkbox labeling via `useGridListSelectionCheckbox`

## Upstream-aligned root/item example

```ts
import { useGridList, useGridListItem, useGridListSelectionCheckbox } from "@vue-aria/gridlist";
import { useListState } from "@vue-aria/list-state";

const listRef = { current: null as HTMLElement | null };
const rowRef = { current: null as HTMLElement | null };

const state = useListState({
  selectionMode: "multiple",
  items: [
    { id: "a", label: "Item A", description: "First row" },
    { id: "b", label: "Item B", description: "Second row" },
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label,
});

const { gridProps } = useGridList(
  {
    "aria-label": "Example grid list",
    keyboardNavigationBehavior: "arrow",
  },
  state,
  listRef
);
const node = state.collection.getItem("a")!;
const { rowProps, gridCellProps, descriptionProps } = useGridListItem({ node }, state, rowRef);
const { checkboxProps } = useGridListSelectionCheckbox({ key: "a" }, state);
```

## Section example

```html
<div v-bind="rowProps" class="gridlist-section-row">
  <div v-bind="rowHeaderProps" class="gridlist-section-header">Favorites</div>
</div>
<div v-bind="rowGroupProps" class="gridlist-section-group">
  <!-- section rows -->
</div>
```

```ts
import { useGridListSection } from "@vue-aria/gridlist";

const { rowProps, rowHeaderProps, rowGroupProps } = useGridListSection(
  { "aria-label": "Favorites" },
  state,
  { current: null }
);
```

## Base markup example

```html
<div v-bind="gridProps" ref="listRef" class="gridlist">
  <div v-bind="rowProps" ref="rowRef" class="gridlist-row">
    <div v-bind="gridCellProps" class="gridlist-cell">
      <input type="checkbox" v-bind="checkboxProps" />
      <div class="gridlist-copy">
        <span class="gridlist-label">Item A</span>
        <span v-bind="descriptionProps" class="gridlist-description">First row</span>
      </div>
      <button type="button" class="gridlist-action">Info</button>
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
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
}

.gridlist-copy {
  display: grid;
  gap: 2px;
}

.gridlist-label {
  font-weight: 600;
}

.gridlist-description {
  color: #66717d;
  font-size: 12px;
}

.gridlist-action {
  margin-left: auto;
}

.gridlist-row:focus-visible {
  outline: 2px solid #0f62fe;
  outline-offset: 2px;
}
```

## Notes

- Pair `useGridList` with either `useListState` or `useTreeState` depending on list vs tree data.
- `useGridListItem` includes row-level tree metadata (`aria-expanded`, level/setsize/posinset) when used with `useTreeState`.
- `Spectrum S2` is out of scope unless explicitly requested.
