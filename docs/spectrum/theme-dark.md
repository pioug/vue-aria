# @vue-spectrum/theme-dark

Vue port baseline of `@react-spectrum/theme-dark`.

<script setup lang="ts">
import { Provider } from "@vue-spectrum/vue-spectrum";
import { theme } from "@vue-spectrum/theme-dark";
</script>

## Preview

<div class="spectrum-preview">
  <Provider
    :theme="theme"
    color-scheme="dark"
    scale="large"
    v-bind="{ UNSAFE_className: 'spectrum-preview-stack' }"
  >
    <p class="spectrum-preview-muted">Dark theme package consumed through Provider:</p>
    <span class="spectrum-preview-chip">dark / large</span>
  </Provider>
</div>

## Exports

- `theme`

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme-dark";
</script>

<template>
  <Provider :theme="theme" color-scheme="dark" scale="large">
    <slot />
  </Provider>
</template>
```

## Notes

- The baseline export uses the provider contract (`global`, `light`, `dark`, `medium`, `large`) and biases both schemes toward dark variants.
- This baseline currently maps class-name sections only; full upstream token/CSS parity remains in progress.
