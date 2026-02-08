# @vue-aria/list-state

Vue-native stately-style list primitives for collection filtering and selection
management.

## `useListState`

Builds filtered list state and exposes a selection manager compatible with list
interaction hooks.

## `useSingleSelectListState`

Single-selection list helper with controlled/uncontrolled `selectedKey` support.

```ts
import { useSingleSelectListState } from "@vue-aria/list-state";

const state = useSingleSelectListState({
  collection: [
    { key: "one" },
    { key: "two" },
  ],
  defaultSelectedKey: "one",
});

state.setSelectedKey("two");
```
