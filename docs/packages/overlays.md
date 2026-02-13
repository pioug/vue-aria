# @vue-aria/overlays

`@vue-aria/overlays` ports overlay positioning and dismissal behavior from upstream `@react-aria/overlays`.

## Implemented modules

- `useOverlay`
- `useOverlayTrigger`
- `useOverlayPosition`
- `usePopover`
- `useModalOverlay`
- `usePreventScroll`
- `useModal`
- `OverlayContainer`
- `OverlayProvider`
- `ModalProvider`
- `DismissButton`
- `Overlay`
- `ariaHideOutside`

## Upstream-aligned example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import { useOverlayTrigger, useOverlay, useOverlayPosition } from "@vue-aria/overlays";

const state = useOverlayTriggerState({});
const triggerRef = { current: null as Element | null };
const overlayRef = { current: null as Element | null };

const { triggerProps } = useOverlayTrigger({ type: "dialog" }, state, triggerRef);
const { overlayProps } = useOverlay({
  isOpen: state.isOpen,
  onClose: state.close,
  isDismissable: true
}, overlayRef);

const { overlayProps: positionProps } = useOverlayPosition({
  targetRef: triggerRef,
  overlayRef,
  isOpen: state.isOpen
});
</script>

<template>
  <button
    :ref="(el) => (triggerRef.current = el as Element | null)"
    v-bind="triggerProps"
    @click="triggerProps.onPress?.()"
  >
    Toggle overlay
  </button>

  <div
    v-if="state.isOpen"
    :ref="(el) => (overlayRef.current = el as Element | null)"
    v-bind="{ ...overlayProps, ...positionProps }"
  >
    Overlay content
  </div>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
