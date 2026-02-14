# @vue-spectrum/theme-light

`@vue-spectrum/theme-light` provides a light-leaning Spectrum theme variant.

## API

- `theme`

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme-light";
</script>

<template>
  <Provider :theme="theme">
    <button type="button">Light theme content</button>
  </Provider>
</template>
```

Use this variant when your application should default to a light-oriented class-map baseline.
