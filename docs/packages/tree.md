# @vue-aria/tree

`@vue-aria/tree` ports upstream `@react-aria/tree` hooks for treegrid semantics and row-level expand/collapse interaction wiring.

## Implemented modules

- `useTree`
- `useTreeItem`

## Upstream-aligned example

```ts
import { useTree, useTreeItem } from "@vue-aria/tree";
import { useTreeState } from "@vue-aria/tree-state";

const treeRef = { current: null as HTMLElement | null };
const rowRef = { current: null as HTMLElement | null };

const state = useTreeState({
  selectionMode: "single",
  defaultExpandedKeys: ["animals"],
  collection: [],
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

## Notes

- `useTree` reuses grid list behavior and forces treegrid role semantics.
- `useTreeItem` exposes `expandButtonProps` for a dedicated disclosure control in each row.
- `Spectrum S2` is out of scope unless explicitly requested.
