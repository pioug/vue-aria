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

### Focus containment

`FocusScope` with `contain` traps keyboard tab navigation inside the active scope, including nested scope behavior.

```vue
<script setup lang="ts">
import { FocusScope } from "@vue-aria/focus";
</script>

<template>
  <FocusScope :contain="true">
    <input />
    <input />
    <FocusScope :contain="true">
      <input />
      <input />
    </FocusScope>
  </FocusScope>
</template>
```

### Restore focus cancellation hook

`FocusScope` dispatches `react-aria-focus-scope-restore` before restoring focus on unmount. You can cancel restoration with `preventDefault()`.

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import { FocusScope } from "@vue-aria/focus";

const root = ref<HTMLElement | null>(null);

const onRestore = (event: Event) => {
  event.preventDefault();
};

onMounted(() => {
  root.value?.addEventListener("react-aria-focus-scope-restore", onRestore);
});

onBeforeUnmount(() => {
  root.value?.removeEventListener("react-aria-focus-scope-restore", onRestore);
});
</script>

<template>
  <div ref="root">
    <FocusScope :restoreFocus="true" :autoFocus="true">
      <input />
    </FocusScope>
  </div>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Current FocusScope parity includes:
  - nested active-scope containment locking
  - restore event cancellation and nested propagation isolation
  - radio-group tabbable traversal rules for containment
- Remaining work focuses on owner-document/iframe parity, deeper portal behavior, and full upstream test migration.
