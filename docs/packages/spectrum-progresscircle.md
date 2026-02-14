# @vue-spectrum/progress - ProgressCircle

`ProgressCircle` shows the progression of an operation in a circular indicator.

## Example

```vue
<script setup lang="ts">
import { ProgressCircle } from "@vue-spectrum/progress";
</script>

<template>
  <ProgressCircle aria-label="Loading..." :value="50" />
</template>
```

## Value

`ProgressCircle` is controlled by `value`.

- Default range is `minValue=0` to `maxValue=100`.
- You can provide a custom range with `minValue` and `maxValue`.

```vue
<template>
  <ProgressCircle aria-label="Loading..." :value="25" />
  <ProgressCircle aria-label="Loading..." :minValue="50" :maxValue="150" :value="100" />
</template>
```

### Indeterminate

```vue
<ProgressCircle aria-label="Loading..." isIndeterminate />
```

## Accessibility

- `aria-label` or `aria-labelledby` is required.
- If `staticColor` is used, ensure sufficient color contrast with its background.

## Internationalization

- Provide localized `aria-label` or `aria-labelledby` values.

## Visual options

### Static color

```vue
<template>
  <div style="background: #095aba; padding: 12px; display: inline-block;">
    <ProgressCircle aria-label="Loading..." staticColor="white" isIndeterminate />
  </div>
  <div style="background: #ffd23f; padding: 12px; display: inline-block;">
    <ProgressCircle aria-label="Loading..." staticColor="black" isIndeterminate />
  </div>
</template>
```

### Size

```vue
<template>
  <ProgressCircle aria-label="Loading..." size="S" :value="15" />
  <ProgressCircle aria-label="Loading..." size="M" :value="30" />
  <ProgressCircle aria-label="Loading..." size="L" :value="60" />
</template>
```

## Related

- [ProgressBar](/packages/spectrum-progressbar)
- `Spectrum S2` remains out of scope unless explicitly requested.
