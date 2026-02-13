# @vue-aria/spinbutton

`@vue-aria/spinbutton` ports spinbutton accessibility behavior from upstream `@react-aria/spinbutton`.

## API

- `useSpinButton`

## Features

- `spinbutton` role and range/value ARIA attributes.
- Keyboard support for increment/decrement and page/home/end shortcuts.
- Increment/decrement press handlers with touch/mouse branching.
- Live announcer updates for focused value text.

## Example

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

## Notes

- This package is a prerequisite for `@vue-aria/numberfield`.
- `Spectrum S2` is ignored for this port.
