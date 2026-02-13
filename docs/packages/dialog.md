# @vue-aria/dialog

`@vue-aria/dialog` ports dialog accessibility behavior from upstream `@react-aria/dialog`.

## Implemented modules

- `useDialog`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useDialog } from "@vue-aria/dialog";

const dialogEl = ref<HTMLElement | null>(null);
const dialogRef = {
  get current() {
    return dialogEl.value;
  },
  set current(value: HTMLElement | null) {
    dialogEl.value = value;
  }
};

const { dialogProps, titleProps } = useDialog({}, dialogRef);
</script>

<template>
  <div v-bind="dialogProps" :ref="(el) => (dialogRef.current = el as HTMLElement | null)">
    <h2 v-bind="titleProps">Dialog title</h2>
    <p>Dialog content</p>
  </div>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Overlay focus containment parity is wired through `@vue-aria/overlays/useOverlayFocusContain`.
