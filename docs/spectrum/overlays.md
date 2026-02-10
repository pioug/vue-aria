# @vue-spectrum/overlays

Vue port baseline of `@react-spectrum/overlays`.

<script setup lang="ts">
import { Overlay } from "@vue-spectrum/vue-spectrum";
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
</div>

## Exports

- `Overlay`
- `OpenTransition`

## Example

```ts
import { h } from "vue";
import { Overlay } from "@vue-spectrum/overlays";

const component = h(
  Overlay,
  { isOpen: true },
  {
    default: () => h("div", { role: "dialog" }, "Modal content"),
  }
);
```

## Notes

- Baseline includes portal mounting behavior and transition lifecycle callback wiring.
- `Modal`, `Popover`, and `Tray` parity remains in progress.
