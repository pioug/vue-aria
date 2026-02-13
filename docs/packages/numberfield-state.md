# @vue-aria/numberfield-state

`@vue-aria/numberfield-state` ports number field state management from upstream `@react-stately/numberfield`.

## API

- `useNumberFieldState`

## Implemented modules

- `useNumberFieldState` (initial parity slice)

## Upstream-aligned example

```ts
import { useNumberFieldState } from "@vue-aria/numberfield-state";

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
