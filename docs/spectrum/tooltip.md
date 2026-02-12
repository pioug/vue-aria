# @vue-spectrum/tooltip

Vue port baseline of `@react-spectrum/tooltip`.

<script setup lang="ts">
import { Tooltip, TooltipTrigger } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <TooltipTrigger>
    <button
      type="button"
      class="spectrum-preview-panel"
      style="cursor: help;">
      Hover or focus me
    </button>
    <Tooltip placement="top">Helpful information.</Tooltip>
  </TooltipTrigger>
</div>

## Exports

- `Tooltip`
- `TooltipTrigger`

## Example

```ts
import { h } from "vue";
import { Tooltip, TooltipTrigger } from "@vue-spectrum/tooltip";

const component = h(
  TooltipTrigger,
  null,
  {
    default: () => [
      h("button", { type: "button" }, "Trigger"),
      h(Tooltip, { placement: "bottom" }, () => "Helpful information."),
    ],
  }
);
```

## Notes

- Baseline includes focus/hover trigger behavior with configurable delayed hover opening (`delay`) and close timing (`closeDelay`), default warmup/cooldown reopen behavior, Escape/press/scroll close handling (including global keyboard-dismiss coverage while focus is outside the trigger), combined focus+hover close edge cases (including focus overriding a pending hover delay), optional no-close-on-press behavior for pointer and keyboard activation (`shouldCloseOnPress=false`), controlled/uncontrolled visibility support (`isOpen`/`defaultOpen`, including concurrent visibility when another tooltip is explicitly controlled open), disabled trigger behavior (`isDisabled`), trigger `aria-describedby` wiring when open, tooltip ref exposure via `UNSAFE_getDOMNode`, portal-based rendering (including `@vue-aria/overlays` `UNSAFE_PortalProvider` custom-container routing + nested null override), and trigger-anchored overlay positioning with placement support (`top`/`bottom`/`left`/`right` plus logical `start`/`end` mapping by direction).
- Advanced icon variants and full transition parity remain in progress.
