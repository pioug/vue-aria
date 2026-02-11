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

- Baseline includes `useNumberField` semantics, clamped min/max handling, controlled/uncontrolled value support, increment/decrement step buttons, long-press auto-repeat stepping, upstream-style platform `inputMode` handling, and focused wheel stepping.
- Description/error wiring, hidden form input (`name`), and SSR coverage are included.
- Baseline now includes `validate(value)` support across ARIA/native validation modes, native required/invalid messaging lifecycle behavior (`checkValidity` display with valid-blur clearing), function-style native `errorMessage` customizers, and `Form.validationErrors` integration by field `name` (including submit-driven native server error behavior) with clear-on-input behavior.
- Advanced locale edge cases remain in progress.
