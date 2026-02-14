# @vue-spectrum/theme

`@vue-spectrum/theme` provides a provider-compatible default Spectrum class-map theme for Vue ports.

## API

- `theme`

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme";
</script>

<template>
  <Provider :theme="theme">
    <button type="button">Themed button</button>
  </Provider>
</template>
```

## Notes

- Current slice is a bootstrap class-map adaptation of upstream theme-default behavior for provider parity.
- Additional theme package variants (light/dark/express) are tracked as follow-up parity work.
- `Spectrum S2` is out of scope unless explicitly requested.
