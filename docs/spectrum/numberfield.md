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

- Baseline includes `useNumberField` semantics, clamped min/max handling, controlled/uncontrolled value support, step-boundary snapping for stepped values (value/default normalization, blur commit, and non-step increment recovery), locale-aware parser behavior for currency/percent inputs with invalid partial-character rejection, full-selection paste commit behavior, invalid non-empty blur reversion to last valid formatted value, increment/decrement step buttons, pointer-type-aware stepper focus behavior (mouse press moves focus to input, non-mouse press keeps focus on the pressed control), long-press auto-repeat stepping, upstream-style platform `inputMode` handling (including currency-without-decimals behavior), focused wheel stepping, empty-field stepper parity (initial step value resolution for unbounded, min-bounded, and max-bounded cases), minus-sign empty-input blur behavior (no spurious `onChange` emission), and custom increment/decrement aria-label support.
- Description/error wiring, hidden form input (`name`), uncontrolled form reset support, controlled null-like reset-to-blank behavior, `data-*` passthrough to the native input, component-ref DOM/focus helpers (`UNSAFE_getDOMNode`, `focus`), and SSR coverage are included.
- Baseline now includes `validate(value)` support across ARIA/native validation modes, native required/invalid messaging lifecycle behavior (`checkValidity` display with valid-blur clearing), function-style native `errorMessage` customizers, and `Form.validationErrors` integration by field `name` (including submit-driven native server error behavior) with clear-on-input behavior.
- Advanced locale edge cases remain in progress.
