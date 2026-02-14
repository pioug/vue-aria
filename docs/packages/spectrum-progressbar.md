# @vue-spectrum/progress - ProgressBar

`ProgressBar` shows the progression of an operation in a horizontal bar.

## Example

```vue
<script setup lang="ts">
import { ProgressBar } from "@vue-spectrum/progress";
</script>

<template>
  <ProgressBar label="Loading..." :value="50" />
</template>
```

## Value

`ProgressBar` is controlled by `value`.

- Default range is `minValue=0` to `maxValue=100`.
- You can provide a custom range with `minValue` and `maxValue`.

```vue
<template>
  <ProgressBar label="Loading..." :value="25" />
  <ProgressBar label="Loading..." :minValue="50" :maxValue="150" :value="100" />
</template>
```

### Indeterminate

```vue
<ProgressBar label="Loading..." isIndeterminate />
```

## Labeling

- Prefer visible `label`.
- If no visible label is provided, pass `aria-label` or `aria-labelledby`.

Use `labelPosition="side"` to move labels to the side, and `showValueLabel={false}` to hide value labels.

```vue
<template>
  <ProgressBar label="Loading..." :value="30" />
  <ProgressBar label="Loading..." labelPosition="side" :value="30" />
  <ProgressBar label="Loading..." :showValueLabel="false" :value="30" />
</template>
```

## Accessibility

- A visible label or ARIA labeling (`aria-label` / `aria-labelledby`) is required.
- If `staticColor` is used, ensure sufficient color contrast with its background.

## Internationalization

- Provide localized values for `label`, `aria-label`, or associated `aria-labelledby` content.
- Value labels are localized via `Intl.NumberFormat` options using `formatOptions`.

## Visual options

### Static color

```vue
<template>
  <div style="background: #095aba; padding: 12px;">
    <ProgressBar label="Loading..." staticColor="white" :value="5" />
  </div>
  <div style="background: #ffd23f; padding: 12px;">
    <ProgressBar label="Loading..." staticColor="black" :value="5" />
  </div>
</template>
```

### Over background variant

```vue
<template>
  <div style="background: #095aba; padding: 12px;">
    <ProgressBar label="Loading..." variant="overBackground" :value="45" />
  </div>
</template>
```

### Size

```vue
<template>
  <ProgressBar label="Small" size="S" :value="70" />
  <ProgressBar label="Large" size="L" :value="70" />
</template>
```

## Related

- [ProgressCircle](/packages/spectrum-progresscircle)
- `Spectrum S2` remains out of scope unless explicitly requested.
