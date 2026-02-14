# @vue-spectrum/theme-express

`@vue-spectrum/theme-express` provides the express variant theme, layered on top of the default theme map.

## API

- `theme`

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme-express";
</script>

<template>
  <Provider :theme="theme">
    <button type="button">Express theme content</button>
  </Provider>
</template>
```

Use this variant for express-specific class-map output while keeping the provider integration API unchanged.
