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
  - owner-document/iframe containment, autofocus, restore-focus, and focus-manager traversal behavior
  - teleported child-scope containment behavior for both `contain` and non-`contain` child scopes
  - shadow-root containment tab traversal behavior
  - restore-focus skip behavior when scope unmounts while focus is already outside the scope
  - contained-scope focus recovery when focused descendants are removed (fallback to first focusable)
  - restore-focus boundary tab handoff relative to the previously focused node (forward and reverse)
  - restore-focus stability across dynamic child updates before unmount
- Remaining work focuses on broader full upstream FocusScope test-file migration.
