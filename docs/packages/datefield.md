# @vue-aria/datefield

Date field accessibility primitives.

## `useDateField`

Provides label, group, description/error wiring, and hidden form input semantics for segmented date fields.

## `useDateSegment`

Provides segment-level editing semantics for each date part (month/day/year/hour, etc).

```ts
import { useDateField, useDateSegment } from "@vue-aria/datefield";

const { labelProps, fieldProps, inputProps } = useDateField(options, state, fieldRef);
const monthSegment = useDateSegment(state.segments[0], state, monthRef);
```

### Behavior

- Supports focus-within validation commit behavior on blur.
- Exposes hidden input semantics for form integration.
- Supports numeric segment typing/backspace and spinbutton-style keyboard increment/decrement.
