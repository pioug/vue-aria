# @vue-aria/progress

`@vue-aria/progress` ports progress bar accessibility hooks from upstream `@react-aria/progress`.

## Implemented modules

- `useProgressBar`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useProgressBar } from "@vue-aria/progress";

const { progressBarProps, labelProps } = useProgressBar({
  label: "Loading",
  value: 45
});
</script>

<template>
  <div v-bind="progressBarProps">
    <span v-bind="labelProps">Loading</span>
  </div>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
