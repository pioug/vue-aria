# @vue-aria/switch

Switch accessibility primitives.

## `useSwitch`

Provides switch semantics on top of checkbox toggle behavior.

```ts
import { ref } from "vue";
import { useSwitch } from "@vue-aria/switch";

const isSelected = ref(false);

const { labelProps, inputProps } = useSwitch(
  {
    "aria-label": "Wi-Fi",
  },
  {
    isSelected,
    setSelected: (value) => {
      isSelected.value = value;
    },
    toggle: () => {
      isSelected.value = !isSelected.value;
    },
  }
);
```

### Behavior

- Sets `role="switch"` while preserving checkbox input mechanics.
- Mirrors selected state to `checked`.
- Reuses press and label interaction behavior from `useCheckbox`.
