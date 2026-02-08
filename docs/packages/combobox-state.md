# @vue-aria/combobox-state

State management for combobox selection, input value, filtering, and popup open
behavior.

## `useComboBoxState`

Provides:

- controlled/uncontrolled selected key and input value
- input filtering via `defaultFilter`
- menu open/close/toggle with trigger reasons
- commit/revert behavior for selected or custom values

```ts
import { useComboBoxState } from "@vue-aria/combobox-state";

const state = useComboBoxState({
  collection: [
    { key: "one", textValue: "One" },
    { key: "two", textValue: "Two" },
  ],
  defaultFilter: (textValue, inputValue) =>
    textValue.toLowerCase().includes(inputValue.toLowerCase()),
});

state.setFocused(true);
state.setInputValue("tw");
```
