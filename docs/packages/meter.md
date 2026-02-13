# @vue-aria/meter

`@vue-aria/meter` ports meter accessibility behavior from upstream `@react-aria/meter`.

## Implemented modules

- `useMeter`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useMeter } from "@vue-aria/meter";

const { meterProps, labelProps } = useMeter({
  label: "Storage",
  value: 72
});
</script>

<template>
  <div v-bind="meterProps">
    <span v-bind="labelProps">Storage</span>
  </div>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
