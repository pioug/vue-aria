# @vue-aria/gridlist

Grid-list accessibility primitives for single-column interactive collections.

## `useGridList`

Provides grid semantics for listbox state with keyboard navigation and selection support.

## `useGridListItem`

Provides row/gridcell semantics for a grid-list item with selection and action wiring.

```ts
import { useGridList, useGridListItem } from "@vue-aria/gridlist";
import { useListBoxState } from "@vue-aria/listbox";

const state = useListBoxState({
  collection: [
    { key: "a", textValue: "Alpha" },
    { key: "b", textValue: "Beta" },
  ],
  selectionMode: "single",
});

const { gridProps } = useGridList({ "aria-label": "Items" }, state, gridRef);
const node = state.getItem("a");
if (node) {
  const { rowProps, gridCellProps } = useGridListItem({ node }, state, rowRef);
}
```
