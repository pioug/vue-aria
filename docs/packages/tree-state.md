# @vue-aria/tree-state

State management for hierarchical collections with expansion and selection.

## `useTreeState`

Provides:

- tree collection model with visible/flattened traversal helpers
- controlled/uncontrolled expanded key state
- selection manager integration for single/multi tree selection

```ts
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

state.toggleKey("animals");
state.selectionManager.select("bear");
```
