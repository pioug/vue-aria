# @vue-aria/disclosure

`@vue-aria/disclosure` ports disclosure accessibility hooks from upstream `@react-aria/disclosure`.

## Implemented modules

- `useDisclosure`
- `@vue-stately/disclosure/useDisclosureState`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useDisclosure } from "@vue-aria/disclosure";
import { useDisclosureState } from "@vue-stately/disclosure";

const panelRef = { current: null as HTMLElement | null };
const state = useDisclosureState({});
const { buttonProps, panelProps } = useDisclosure({}, state, panelRef);
</script>

<template>
  <button v-bind="buttonProps" @click="buttonProps.onPress?.({ pointerType: 'mouse' })">
    Toggle
  </button>
  <div v-bind="panelProps" :ref="(el) => (panelRef.current = el as HTMLElement | null)">
    Disclosure content
  </div>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
