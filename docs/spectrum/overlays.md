# @vue-spectrum/overlays

Vue port baseline of `@react-spectrum/overlays`.

<script setup lang="ts">
import { ref } from "vue";
import { Modal, Overlay, Popover, Tray } from "@vue-spectrum/vue-spectrum";

const popoverTrigger = ref<HTMLElement | null>(null);
</script>

## Preview

<div class="spectrum-preview">
  <Overlay :isOpen="true">
    <div
      class="spectrum-preview-panel"
      role="dialog"
      aria-label="Preview overlay"
      style="max-width: 320px; margin: 0 auto; text-align: center;">
      Overlay content rendered in a portal.
    </div>
  </Overlay>
  <div class="spectrum-preview-panel" style="max-width: 320px; margin: 0 auto; text-align: center;">
    <button ref="popoverTrigger" type="button">Popover anchor</button>
    <Popover :isOpen="true" :trigger-ref="popoverTrigger ?? undefined">
      <div role="dialog" aria-label="Preview popover">Popover content.</div>
    </Popover>
  </div>
  <Modal :isOpen="true">
    <div
      class="spectrum-preview-panel"
      role="dialog"
      aria-label="Preview modal"
      style="max-width: 320px; margin: 0 auto; text-align: center;">
      Modal content with underlay + dismiss wiring.
    </div>
  </Modal>
  <Tray :isOpen="true">
    <div
      class="spectrum-preview-panel"
      role="dialog"
      aria-label="Preview tray"
      style="max-width: 320px; margin: 0 auto; text-align: center;">
      Tray content with mobile-style dismiss behavior.
    </div>
  </Tray>
</div>

## Exports

- `Overlay`
- `Popover`
- `Modal`
- `Tray`
- `OpenTransition`

## Example

```vue
<script setup lang="ts">
import { Modal, Overlay, Popover, Tray } from "@vue-spectrum/overlays";
</script>

<template>
  <Modal />
</template>
```

## Notes

- Baseline includes portal mounting behavior and transition lifecycle callback wiring, including portal-container context support via `@vue-aria/overlays` `UNSAFE_PortalProvider` (with nested `getContainer={null}` override semantics).
- Baseline now includes `Popover` with `@vue-aria/overlays` positioning/dismiss wiring (`Escape` close, modal-underlay press close behavior, close-on-blur focus-within behavior, optional non-modal mode, locale-aware hidden dismiss buttons, and arrow visibility toggle).
- Baseline now includes `Modal` with `@vue-aria/overlays` modal semantics (`Escape` close, optional outside-dismiss, underlay, and scroll-lock/focus-containment behavior).
- Baseline now includes `Tray` with dismissable modal-overlay semantics (outside-click close, `Escape` close, optional blur-close via `shouldCloseOnBlur`, locale-aware hidden dismiss buttons, fixed-height class support, and scroll-lock/focus-containment behavior).
