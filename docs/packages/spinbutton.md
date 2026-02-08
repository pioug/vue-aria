# @vue-aria/spinbutton

Spinbutton semantics and stepper interaction primitives.

## `useSpinButton`

Provides ARIA spinbutton props and keyboard/stepper interaction behavior.

```ts
import { useSpinButton } from "@vue-aria/spinbutton";

const { spinButtonProps, incrementButtonProps, decrementButtonProps } = useSpinButton({
  value: 2,
  minValue: 0,
  maxValue: 10,
  onIncrement: () => {},
  onDecrement: () => {},
});
```

### Behavior

- Emits spinbutton role and value-related ARIA attributes.
- Handles Arrow/Page/Home/End keyboard semantics.
- Supports touch vs mouse stepper press behavior.
