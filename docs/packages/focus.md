# @vue-aria/focus

`@vue-aria/focus` ports focus management primitives from upstream `@react-aria/focus`.

## Implemented modules

- `getFocusableTreeWalker`
- `createFocusManager`
- `FocusScope` (Vue adaptation)
- `useFocusManager`
- `isElementInChildOfActiveScope`
- `moveVirtualFocus`
- `dispatchVirtualBlur`
- `dispatchVirtualFocus`
- `getVirtuallyFocusedElement`
- `useFocusRing`
- `FocusRing`
- `useHasTabbableChild`

## Upstream-aligned examples

### useFocusRing

```vue
<script setup lang="ts">
import { useFocusRing } from "@vue-aria/focus";

const { focusProps, isFocusVisible } = useFocusRing();
</script>

<template>
  <button v-bind="focusProps" :class="{ 'focus-ring': isFocusVisible }">
    Focus me
  </button>
</template>
```

### FocusScope + useFocusManager

```vue
<script setup lang="ts">
import { FocusScope, useFocusManager } from "@vue-aria/focus";

const focusManager = useFocusManager();
const next = () => focusManager?.focusNext();
</script>

<template>
  <FocusScope :autoFocus="true">
    <button @click="next">Next</button>
    <button>Second</button>
  </FocusScope>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Remaining work focuses on deeper FocusScope containment/restore semantics and full upstream test parity.
