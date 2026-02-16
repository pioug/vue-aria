# @vue-aria/combobox

`@vue-aria/combobox` ports upstream `@react-aria/combobox` accessibility hooks for a text input + listbox suggestion pattern.

## Implemented modules

- `useComboBox`

## Upstream-aligned example

```ts
import { useComboBox } from "@vue-aria/combobox";
import { useComboBoxState } from "@vue-stately/combobox";

const inputRef = { current: null as HTMLInputElement | null };
const listBoxRef = { current: null as HTMLElement | null };
const popoverRef = { current: null as Element | null };
const buttonRef = { current: null as Element | null };

const state = useComboBoxState({
  items: [
    { id: "0", name: "One" },
    { id: "1", name: "Two" },
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.name,
});

const { labelProps, inputProps, buttonProps, listBoxProps } = useComboBox(
  {
    label: "Example",
    inputRef,
    listBoxRef,
    popoverRef,
    buttonRef,
  },
  state
);
```

## Notes

- This package is behavioral (hook-level); visual parity is validated in downstream component integrations.
- `Spectrum S2` is out of scope unless explicitly requested.
