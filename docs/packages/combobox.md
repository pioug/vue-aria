# @vue-aria/combobox

ARIA hook for combobox input/listbox/button wiring on top of
`@vue-aria/combobox-state`.

## `useComboBox`

Returns:

- `labelProps`
- `inputProps`
- `listBoxProps`
- `buttonProps`
- `descriptionProps`
- `errorMessageProps`

```ts
import { useComboBox } from "@vue-aria/combobox";
import { useComboBoxState } from "@vue-aria/combobox-state";

const state = useComboBoxState({
  collection: [
    { key: "one", textValue: "One" },
    { key: "two", textValue: "Two" },
  ],
});

const aria = useComboBox(
  {
    inputRef,
    listBoxRef,
    popoverRef,
  },
  state
);
```
