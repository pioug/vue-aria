# @vue-aria/visually-hidden

Hide content visually while keeping it available to assistive technologies.

## `useVisuallyHidden`

```ts
import { useVisuallyHidden } from "@vue-aria/visually-hidden";

const { visuallyHiddenProps } = useVisuallyHidden({
  isFocusable: true,
});
```

### Behavior

- Applies a standard visually-hidden style object by default.
- If `isFocusable` is true, the content becomes visible while focused.
- Supports style overrides merged onto hidden styles.

## `VisuallyHidden` Component

```vue
<script setup lang="ts">
import { VisuallyHidden } from "@vue-aria/visually-hidden";
</script>

<template>
  <VisuallyHidden :isFocusable="true">
    <a href="#main-content">Skip to content</a>
  </VisuallyHidden>
</template>
```
