# @vue-spectrum/theme-light

Vue port baseline of `@react-spectrum/theme-light`.

<script setup lang="ts">
import { Provider } from "@vue-spectrum/vue-spectrum";
import { theme } from "@vue-spectrum/theme-light";
</script>

## Preview

<div class="spectrum-preview">
  <Provider
    :theme="theme"
    color-scheme="light"
    scale="medium"
    v-bind="{ UNSAFE_className: 'spectrum-preview-stack' }"
  >
    <p class="spectrum-preview-muted">Light theme package consumed through Provider:</p>
    <span class="spectrum-preview-chip">light / medium</span>
  </Provider>
</div>

## Exports

- `theme`

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme-light";
</script>

<template>
  <Provider :theme="theme" color-scheme="light" scale="medium">
    <slot />
  </Provider>
</template>
```

## Notes

- The baseline export uses the provider contract (`global`, `light`, `dark`, `medium`, `large`) and includes light/dark class variants aligned with the light theme package intent.
- This baseline currently maps to class-name sections only; full upstream token/CSS parity remains in progress.
