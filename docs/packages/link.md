# @vue-aria/link

`@vue-aria/link` ports link interaction/accessibility hooks from upstream `@react-aria/link`.

## Implemented modules

- `useLink`

## Upstream-aligned examples

### useLink

```vue
<script setup lang="ts">
import { useLink } from "@vue-aria/link";

const { linkProps, isPressed } = useLink({
  href: "/docs",
  elementType: "a"
});
</script>

<template>
  <a v-bind="linkProps" :data-pressed="isPressed">Docs</a>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Remaining work focuses on deeper router/navigation integration validation in downstream consumers.
