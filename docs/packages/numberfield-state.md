# @vue-stately/numberfield

`@vue-stately/numberfield` ports number field state management from upstream `@react-stately/numberfield`.

## API

- `useNumberFieldState`

## Implemented modules

- `useNumberFieldState` (initial parity slice)

## Upstream-aligned example

```ts
import { useNumberFieldState } from "@vue-stately/numberfield";

const state = useNumberFieldState({
  locale: "en-US",
  defaultValue: 5,
  minValue: 0,
  maxValue: 10,
});
```

## Notes

- Current slice focuses on parsing/formatting/step math and exposes validation-state placeholders.
- `Spectrum S2` is ignored for this port.
