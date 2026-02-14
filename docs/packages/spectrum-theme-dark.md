# @vue-spectrum/theme-dark

`@vue-spectrum/theme-dark` provides a dark-leaning Spectrum theme variant.

## API

- `theme`

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme-dark";
</script>

<template>
  <Provider :theme="theme">
    <button type="button">Dark theme content</button>
  </Provider>
</template>
```

Use this variant when your application should default to a dark-oriented class-map baseline.
