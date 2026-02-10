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

- Baseline includes focus/hover trigger behavior, Escape close handling, and portal-based rendering.
- Advanced positioning, icon variants, and full transition parity remain in progress.
