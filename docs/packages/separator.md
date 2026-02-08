# @vue-aria/separator

Accessible separator semantics.

## `useSeparator`

```ts
import { useSeparator } from "@vue-aria/separator";

const { separatorProps } = useSeparator({
  orientation: "vertical",
});
```

### Behavior

- Applies `role="separator"` for non-`hr` elements.
- Applies `aria-orientation="vertical"` only for vertical orientation.
- Leaves role/orientation implicit for `hr` elements.
- Passes through labeling props (`aria-label`, `aria-labelledby`, `id`).
