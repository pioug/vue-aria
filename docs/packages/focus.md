# @vue-aria/focus

Focus modality and focus-ring primitives.

## `useFocusVisible`

Global signal for keyboard vs pointer modality.

```ts
import { useFocusVisible } from "@vue-aria/focus";

const isFocusVisible = useFocusVisible();
```

### Behavior

- Keyboard interaction sets focus-visible mode.
- Pointer interaction disables focus-visible mode.

## `useFocusRing`

Tracks per-element focus and focus-visible state.

```ts
import { useFocusRing } from "@vue-aria/focus";

const { focusProps, isFocused, isFocusVisible } = useFocusRing();
```

### Return Value

- `focusProps`: bind on the target element
- `isFocused`: reactive focus state
- `isFocusVisible`: reactive focus-visible state

### Composition Example

```vue
<script setup lang="ts">
import { useFocusRing } from "@vue-aria/focus";

const { focusProps, isFocusVisible } = useFocusRing();
</script>

<template>
  <button
    v-bind="focusProps"
    :data-focus-visible="isFocusVisible ? '' : undefined"
  >
    Focus me
  </button>
</template>
```
