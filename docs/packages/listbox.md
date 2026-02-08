# @vue-aria/listbox

Listbox accessibility primitives.

## `useListBoxState`

State adapter for listbox collections, focus, and selection state.

## `useListBox`

Provides listbox semantics, labeling, and keyboard interaction behavior.

## `useOption`

Provides option semantics, selection interaction, and metadata wiring.

## `useListBoxSection`

Provides section heading and group semantics for grouped listbox content.

```ts
import {
  useListBoxState,
  useListBox,
  useOption,
  useListBoxSection,
} from "@vue-aria/listbox";

const state = useListBoxState({
  collection: [{ key: "apple" }, { key: "banana" }],
  selectionMode: "single",
});
const { listBoxProps } = useListBox({ "aria-label": "Fruits" }, state, listRef);
const { optionProps } = useOption({ key: "apple" }, state, optionRef);
const section = useListBoxSection({
  heading: "Fruits",
});
```
