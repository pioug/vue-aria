# @vue-aria/numberfield

Number-input accessibility primitives.

## `useNumberField`

Builds on `useTextField` and adds numeric commit/stepper behavior.

```ts
import { useNumberField } from "@vue-aria/numberfield";

const {
  groupProps,
  inputProps,
  incrementButtonProps,
  decrementButtonProps,
} = useNumberField({
  "aria-label": "Quantity",
  minValue: 0,
  maxValue: 10,
  step: 1,
});
```

### Behavior

- Uses text input semantics with number parsing/formatting.
- Supports min/max clamping and step-based increment/decrement.
- Commits on Enter and blur.
- Exposes stepper button props for button hooks/components.
