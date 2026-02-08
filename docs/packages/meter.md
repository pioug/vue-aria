# @vue-aria/meter

Meter accessibility primitives.

## `useMeter`

Provides meter semantics by building on top of `useProgressBar`.

```ts
import { useMeter } from "@vue-aria/meter";

const { meterProps, labelProps } = useMeter({
  label: "Storage usage",
  value: 75,
});
```

### Behavior

- Uses `role="meter progressbar"` for broad browser/screen-reader compatibility.
- Supports default percent formatting and custom `valueLabel`.
- Preserves label wiring from `useProgressBar`.
