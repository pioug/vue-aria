# @vue-aria/separator

`@vue-aria/separator` ports separator accessibility behavior from upstream `@react-aria/separator`.

## Implemented modules

- `useSeparator`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useSeparator } from "@vue-aria/separator";

const { separatorProps } = useSeparator({ orientation: "vertical" });
</script>

<template>
  <div v-bind="separatorProps"></div>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
