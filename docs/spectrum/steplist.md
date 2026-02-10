# @vue-spectrum/steplist

Vue port baseline of `@react-spectrum/steplist`.

<script setup lang="ts">
import { StepList } from "@vue-spectrum/vue-spectrum";

const steps = [
  { key: "account", label: "Account" },
  { key: "billing", label: "Billing" },
  { key: "review", label: "Review" },
];
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 560px;">
    <StepList
      aria-label="Checkout flow"
      :items="steps"
      defaultLastCompletedStep="account"
      defaultSelectedKey="billing" />
  </div>
</div>

## Exports

- `StepList`
- `StepListItem`

## Example

```ts
import { h } from "vue";
import { StepList } from "@vue-spectrum/steplist";

const component = h(StepList, {
  "aria-label": "Checkout flow",
  items: [
    { key: "account", label: "Account" },
    { key: "billing", label: "Billing" },
    { key: "review", label: "Review" },
  ],
  defaultLastCompletedStep: "account",
  defaultSelectedKey: "billing",
});
```

## Notes

- Baseline includes selection progression rules, disabled/read-only handling, controlled/uncontrolled selection, and SSR coverage.
- Advanced upstream collections integration (`Item` API parity), icon visuals, and localized state messages remain in progress.
