# @vue-spectrum/theme-default

Vue port baseline of `@react-spectrum/theme-default`.

<script setup lang="ts">
import { Provider } from "@vue-spectrum/vue-spectrum";
import { theme } from "@vue-spectrum/theme-default";
</script>

## Preview

<div class="spectrum-preview">
  <Provider
    :theme="theme"
    color-scheme="dark"
    scale="large"
    v-bind="{ UNSAFE_className: 'spectrum-preview-stack' }"
  >
    <p class="spectrum-preview-muted">Default theme package consumed through Provider:</p>
    <span class="spectrum-preview-chip">dark / large</span>
  </Provider>
</div>

## Exports

- `theme`

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme-default";
</script>

<template>
  <Provider :theme="theme" color-scheme="light" scale="medium">
    <slot />
  </Provider>
</template>
```

## Notes

- The baseline export mirrors the provider class-map contract (`global`, `light`, `dark`, `medium`, `large`).
- This package currently reuses the migration baseline class-map values from `@vue-spectrum/provider`.
- Full parity with upstream token/CSS distribution remains in progress and is tracked under the theme package roadmap.
