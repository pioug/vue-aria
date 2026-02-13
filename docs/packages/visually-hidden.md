# @vue-aria/visually-hidden

`@vue-aria/visually-hidden` ports visually-hidden accessibility utilities from upstream `@react-aria/visually-hidden`.

## Implemented modules

- `useVisuallyHidden`
- `VisuallyHidden`

## Upstream-aligned examples

### useVisuallyHidden

```vue
<script setup lang="ts">
import { useVisuallyHidden } from "@vue-aria/visually-hidden";

const { visuallyHiddenProps } = useVisuallyHidden({ isFocusable: true });
</script>

<template>
  <span v-bind="visuallyHiddenProps">Screen reader text</span>
</template>
```

### VisuallyHidden

```vue
<script setup lang="ts">
import { VisuallyHidden } from "@vue-aria/visually-hidden";
</script>

<template>
  <VisuallyHidden>
    <span>Hidden label</span>
  </VisuallyHidden>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Remaining work focuses on broader integration coverage in downstream component packages.
