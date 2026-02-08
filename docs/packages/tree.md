# @vue-aria/tree

Tree accessibility primitives for treegrid-style collections.

## `useTree`

Provides treegrid semantics, keyboard navigation, typeahead, and selection/action wiring for tree state.

## `useTreeItem`

Provides row and cell semantics for a tree item, including expand/collapse button props and selection behavior.

```ts
import { useTree, useTreeItem } from "@vue-aria/tree";
import { useTreeState } from "@vue-aria/tree-state";

const state = useTreeState({
  collection: [
    {
      key: "animals",
      children: [{ key: "bear" }, { key: "snake" }],
    },
  ],
  selectionMode: "multiple",
});

const { gridProps } = useTree({ "aria-label": "Items" }, state, treeRef);
const node = state.collection.value.getNode("animals");
if (node) {
  const { rowProps, gridCellProps, expandButtonProps } = useTreeItem(
    { node },
    state,
    rowRef
  );
}
```
