# @vue-aria/utils-state

`@vue-aria/utils-state` ports upstream `@react-stately/utils` state helpers for controlled/uncontrolled value handling and numeric helpers.

## Implemented modules

- `useControlledState`
- `clamp`
- `snapValueToStep`
- `toFixedNumber`
- `roundToStepPrecision`

## Upstream-aligned example

```ts
import { useControlledState, clamp, snapValueToStep } from "@vue-aria/utils-state";

const [value, setValue] = useControlledState<number | undefined>(
  undefined,
  10,
  (next) => {
    console.log("changed", next);
  }
);

setValue(clamp(12, 0, 20));

const stepped = snapValueToStep(value.value ?? 0, 0, 100, 5);
```

## Notes

- This package is non-visual; no base styles are required.
- `Spectrum S2` is out of scope unless explicitly requested.
