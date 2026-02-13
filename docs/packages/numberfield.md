# @vue-aria/numberfield

`@vue-aria/numberfield` ports number field accessibility behavior from upstream `@react-aria/numberfield`.

## API

- `useNumberField`

## Implemented modules

- `useNumberField` (initial parity slice)

## Upstream-aligned example

```ts
import { useNumberField } from "@vue-aria/numberfield";

const inputRef = { current: null as HTMLInputElement | null };
const state = {} as any;

const { groupProps, inputProps, incrementButtonProps, decrementButtonProps } = useNumberField(
  { label: "Quantity" },
  state,
  inputRef
);
```

## Notes

- This package uses `@vue-aria/spinbutton` for stepper keyboard/press semantics.
- `Spectrum S2` is ignored for this port.
