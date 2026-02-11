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

```ts
import { h } from "vue";
import { Modal, Overlay, Popover, Tray } from "@vue-spectrum/overlays";

const component = h(
  Overlay,
  { isOpen: true },
  {
    default: () => h("div", { role: "dialog" }, "Modal content"),
  }
);

const popover = h(
  Popover,
  {
    isOpen: true,
    triggerRef: document.getElementById("anchor") ?? undefined,
    placement: "bottom",
  },
  {
    default: () => h("div", { role: "dialog" }, "Popover content"),
  }
);

const modal = h(
  Modal,
  {
    isOpen: true,
    isDismissable: true,
  },
  {
    default: () => h("div", { role: "dialog" }, "Modal content"),
  }
);

const tray = h(
  Tray,
  {
    isOpen: true,
    isFixedHeight: true,
  },
  {
    default: () => h("div", { role: "dialog" }, "Tray content"),
  }
);
```

## Notes

- Baseline includes portal mounting behavior and transition lifecycle callback wiring.
- Baseline now includes `Popover` with `@vue-aria/overlays` positioning/dismiss wiring (`Escape` close, underlay for modal mode, optional non-modal mode, and arrow visibility toggle).
- Baseline now includes `Modal` with `@vue-aria/overlays` modal semantics (`Escape` close, optional outside-dismiss, underlay, and scroll-lock/focus-containment behavior).
- Baseline now includes `Tray` with dismissable modal-overlay semantics (outside-click close, `Escape` close, hidden dismiss buttons, fixed-height class support, and scroll-lock/focus-containment behavior).
