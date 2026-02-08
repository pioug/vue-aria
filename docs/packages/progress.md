# @vue-aria/progress

Progress accessibility primitives.

## `useProgressBar`

Provides ARIA semantics for determinate and indeterminate progress bars.

## `useProgressCircle`

Provides circle-progress semantics by reusing progressbar accessibility behavior.

```ts
import { useProgressBar, useProgressCircle } from "@vue-aria/progress";

const { progressBarProps, labelProps } = useProgressBar({
  label: "Upload progress",
  value: 42,
});

const { progressCircleProps } = useProgressCircle({
  label: "Upload progress",
  value: 42,
});
```

### Behavior

- Adds `role="progressbar"` semantics.
- Supports determinate and indeterminate modes.
- Formats value text by default (percent), with custom `valueLabel` support.
- `useProgressCircle` returns the same progress semantics under `progressCircleProps`.
