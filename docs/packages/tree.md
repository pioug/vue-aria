# @vue-aria/tree

`@vue-aria/tree` ports upstream `@react-aria/tree` hooks for treegrid semantics and row-level expand/collapse interaction wiring.

## Implemented modules

- `useTree`
- `useTreeItem`

## Feature coverage

- Treegrid root semantics via `useTree` (`role="treegrid"`)
- Row-level expansion and collapse wiring via keyboard and press interactions
- Expand/collapse button props with localized labels (`expand` / `collapse`)
- Focus restoration and focused-key updates on expansion actions

## Upstream-aligned example

```ts
import { useTree, useTreeItem } from "@vue-aria/tree";
import { useTreeState } from "@vue-aria/tree-state";

const treeRef = { current: null as HTMLElement | null };
const rowRef = { current: null as HTMLElement | null };

const state = useTreeState({
  selectionMode: "single",
  defaultExpandedKeys: ["animals"],
  items: [
    {
      id: "animals",
      label: "Animals",
      children: [
        { id: "aardvark", label: "Aardvark" },
        { id: "bear", label: "Bear" },
      ],
    },
    { id: "plants", label: "Plants" },
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label,
  getChildren: (item) => item.children,
});

const { gridProps } = useTree({ "aria-label": "Example tree" }, state, treeRef);
const node = state.collection.getFirstKey() != null ? state.collection.getItem(state.collection.getFirstKey()!) : null;
if (node) {
  const { rowProps, gridCellProps, expandButtonProps } = useTreeItem({ node }, state, rowRef);
  void rowProps;
  void gridCellProps;
  void expandButtonProps;
}
```

## Base markup example

```html
<div v-bind="gridProps" ref="treeRef" class="treegrid">
  <div v-bind="rowProps" ref="rowRef" class="tree-row">
    <div v-bind="gridCellProps" class="tree-cell">
      <button type="button" v-bind="expandButtonProps" class="tree-expander">▸</button>
      <span class="tree-label">Animals</span>
    </div>
  </div>
</div>
```

```css
.treegrid {
  border: 1px solid #ccd3da;
  border-radius: 8px;
  padding: 6px;
}

.tree-row + .tree-row {
  margin-top: 4px;
}

.tree-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
}

.tree-expander {
  width: 24px;
  height: 24px;
}

.tree-row:focus-visible {
  outline: 2px solid #0f62fe;
  outline-offset: 2px;
}
```

## Notes

- `useTree` reuses grid list behavior and forces treegrid role semantics.
- `useTreeItem` exposes `expandButtonProps` for a dedicated disclosure control in each row.
- Keyboard interaction parity currently includes integrated expansion/collapse and directional navigation harness coverage in tests.
- `Spectrum S2` is out of scope unless explicitly requested.
