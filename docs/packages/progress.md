# @vue-aria/progress

Progress accessibility primitives.

## `useProgressBar`

Provides ARIA semantics for determinate and indeterminate progress bars.

```ts
import { useProgressBar } from "@vue-aria/progress";

const { progressBarProps, labelProps } = useProgressBar({
  label: "Upload progress",
  value: 42,
});
```

### Behavior

- Adds `role="progressbar"` semantics.
- Supports determinate and indeterminate modes.
- Formats value text by default (percent), with custom `valueLabel` support.
