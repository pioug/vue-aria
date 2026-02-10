# @vue-spectrum/numberfield

Vue port baseline of `@react-spectrum/numberfield`.

<script setup lang="ts">
import { NumberField } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 420px;">
    <NumberField label="Items" :defaultValue="2" :minValue="0" />
  </div>
</div>

## Exports

- `NumberField`

## Example

```ts
import { h } from "vue";
import { NumberField } from "@vue-spectrum/numberfield";

const field = h(NumberField, {
  label: "Quantity",
  minValue: 0,
  step: 1,
  onChange: (value) => {
    console.log("next value", value);
  },
});
```

## Notes

- Baseline includes `useNumberField` semantics, clamped min/max handling, controlled/uncontrolled value support, and increment/decrement step buttons.
- Description/error wiring, hidden form input (`name`), and SSR coverage are included.
- Advanced upstream locale/inputMode and wheel/long-press interaction parity remains in progress.
