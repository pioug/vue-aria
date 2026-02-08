# @vue-aria/selection-state

Stately-style multiple selection and focus state primitives.

## `useMultipleSelectionState`

Provides controlled/uncontrolled selected key sets, selection behavior mode,
focus state, and disabled-key tracking.

```ts
import { useMultipleSelectionState } from "@vue-aria/selection-state";

const state = useMultipleSelectionState({
  selectionMode: "multiple",
  defaultSelectedKeys: ["one"],
});

state.setSelectedKeys(["one", "two"]);
state.setFocusedKey("one");
```
