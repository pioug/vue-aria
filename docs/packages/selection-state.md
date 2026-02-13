# @vue-aria/selection-state

`@vue-aria/selection-state` ports upstream `@react-stately/selection` state primitives to Vue-friendly APIs.

## Implemented modules

- `Selection`
- `useMultipleSelectionState`
- `SelectionManager`

## Upstream-aligned examples

### `useMultipleSelectionState`

```ts
import { useMultipleSelectionState, Selection } from "@vue-aria/selection-state";

const state = useMultipleSelectionState({
  selectionMode: "multiple",
  defaultSelectedKeys: new Selection(["a"])
});

state.setFocused(true);
state.setFocusedKey("a");
state.setSelectedKeys(new Selection(["a", "b"]));
```

### `SelectionManager`

```ts
import { SelectionManager, useMultipleSelectionState } from "@vue-aria/selection-state";

const state = useMultipleSelectionState({
  selectionMode: "multiple",
  selectionBehavior: "replace"
});

// collection must implement the collection contract used by SelectionManager.
const manager = new SelectionManager(collection, state);

manager.replaceSelection("a");
manager.toggleSelection("b");
manager.selectAll();
```

## Notes

- Supports modality-aware selection behavior (`replace` vs `toggle`), including touch/virtual selection paths.
- Exposes `setSelectionBehavior` on the manager contract for parity with upstream selection behavior switching.
