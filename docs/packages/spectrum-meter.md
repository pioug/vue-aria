# @vue-spectrum/meter - Meter

`Meter` is a visual representation of a quantity or achievement.

## Example

```vue
<script setup lang="ts">
import { Meter } from "@vue-spectrum/meter";
</script>

<template>
  <Meter label="Storage space" :value="35" />
</template>
```

## Value

`Meter` is controlled by `value`.

- Default range is `minValue=0` to `maxValue=100`.
- You can provide a custom range with `minValue` and `maxValue`.

```vue
<template>
  <Meter label="Storage space" :value="25" />
  <Meter label="Widgets Used" :minValue="50" :maxValue="150" :value="100" />
</template>
```

Use `formatOptions` to customize value formatting.

```vue
<Meter label="Currency" :formatOptions="{ style: 'currency', currency: 'JPY' }" :value="60" />
```

## Labeling

- Prefer visible `label`.
- If no visible label is provided, pass `aria-label` or `aria-labelledby`.

Use `labelPosition="side"` to move labels to the side, and `showValueLabel={false}` to hide value labels.

```vue
<template>
  <Meter label="Label" :value="25" variant="warning" />
  <Meter label="Label" labelPosition="side" :value="25" variant="warning" />
  <Meter label="Label" :showValueLabel="false" :value="25" variant="warning" />
</template>
```

You can override the value text with `valueLabel`.

```vue
<Meter label="Progress" :value="25" valueLabel="1 of 4" variant="warning" />
```

## Accessibility

- A visible label or ARIA labeling (`aria-label` / `aria-labelledby`) is required.

## Internationalization

- Provide localized label content.
- Value labels are localized by default and can be customized through `formatOptions`.

## Visual options

### Size

```vue
<template>
  <Meter label="Space used" size="S" :value="90" variant="critical" />
  <Meter label="Space used" size="L" :value="90" variant="critical" />
</template>
```

### Variant

```vue
<template>
  <Meter label="Space used" :value="25" variant="informative" />
  <Meter label="Space used" :value="25" variant="positive" />
  <Meter label="Space used" :value="90" variant="critical" />
  <Meter label="Space used" :value="70" variant="warning" />
</template>
```

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
