# @vue-aria/combobox-state

`@vue-aria/combobox-state` ports upstream `@react-stately/combobox` state management for input value, menu open state, filtering, and selection workflows.

## Implemented modules

- `useComboBoxState`

## Upstream-aligned example

```ts
import { useComboBoxState } from "@vue-aria/combobox-state";

const state = useComboBoxState({
  items: [
    { id: "0", name: "One" },
    { id: "1", name: "Two" },
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.name,
  defaultFilter: (text, input) =>
    text.toLowerCase().includes(input.toLowerCase()),
});

state.open("first", "manual");
state.setInputValue("o");
state.commit();
```

## Notes

- This is a state package; no dedicated base styles are required.
- `Spectrum S2` is out of scope unless explicitly requested.
