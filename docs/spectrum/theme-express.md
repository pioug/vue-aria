# @vue-spectrum/theme-express

Vue port baseline of `@react-spectrum/theme-express`.

<script setup lang="ts">
import { Provider } from "@vue-spectrum/vue-spectrum";
import { theme } from "@vue-spectrum/theme-express";
</script>

## Preview

<div class="spectrum-preview">
  <Provider
    :theme="theme"
    color-scheme="light"
    scale="large"
    v-bind="{ UNSAFE_className: 'spectrum-preview-stack' }"
  >
    <p class="spectrum-preview-muted">Express theme package consumed through Provider:</p>
    <span class="spectrum-preview-chip">light / large</span>
  </Provider>
</div>

## Exports

- `theme`

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme-express";
</script>

<template>
  <Provider :theme="theme" color-scheme="light" scale="large">
    <slot />
  </Provider>
</template>
```

## Notes

- The baseline export uses the provider contract (`global`, `light`, `dark`, `medium`, `large`) and layers express classes on top of `@vue-spectrum/theme-default`.
- Express-specific classes currently include `spectrum--express`, `spectrum--express-medium`, and `spectrum--express-large`.
- This baseline currently maps class-name sections only; full upstream token/CSS parity remains in progress.
