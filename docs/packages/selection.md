# @vue-aria/selection

Selection keyboard and typeahead primitives for collection-based components.

## `useListKeyboardDelegate`

Creates a keyboard delegate for list-style collections, including disabled-key skipping,
orientation/direction support, and search key lookup.

## `useGridKeyboardDelegate`

Creates a keyboard delegate for two-dimensional grid collections (row/column navigation + typeahead).

## `useTypeSelect`

Adds typeahead behavior that focuses matching items via a keyboard delegate.

```ts
import {
  useListKeyboardDelegate,
  useGridKeyboardDelegate,
  useTypeSelect,
} from "@vue-aria/selection";

const keyboardDelegate = useListKeyboardDelegate({
  collection: state.collection,
  disabledKeys: state.disabledKeys,
});

const gridKeyboardDelegate = useGridKeyboardDelegate({
  collection: cellCollection,
});

const { typeSelectProps } = useTypeSelect({
  keyboardDelegate,
  focusedKey: state.focusedKey,
  setFocusedKey: state.setFocusedKey,
});
```
