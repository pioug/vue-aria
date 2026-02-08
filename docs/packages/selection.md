# @vue-aria/selection

Selection keyboard and typeahead primitives for collection-based components.

## `useListKeyboardDelegate`

Creates a keyboard delegate for list-style collections, including disabled-key skipping,
orientation/direction support, and search key lookup.

## `useTypeSelect`

Adds typeahead behavior that focuses matching items via a keyboard delegate.

```ts
import { useListKeyboardDelegate, useTypeSelect } from "@vue-aria/selection";

const keyboardDelegate = useListKeyboardDelegate({
  collection: state.collection,
  disabledKeys: state.disabledKeys,
});

const { typeSelectProps } = useTypeSelect({
  keyboardDelegate,
  focusedKey: state.focusedKey,
  setFocusedKey: state.setFocusedKey,
});
```
