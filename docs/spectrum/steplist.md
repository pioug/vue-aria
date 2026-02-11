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
- `Item` (alias of `StepListItem` for v1 compatibility)

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

- Baseline includes selection progression rules, disabled/read-only handling, controlled/uncontrolled selection, SSR coverage, and static slot composition support via `StepListItem`.
- Package also exports upstream-compatible `Item` alias for React Spectrum-style composition.
- Baseline includes localized step-state messages for screen readers (`current`, `completed`, `notCompleted`) via `@vue-aria/i18n`.
- Baseline includes segment/chevron step visuals (including RTL chevron direction handling).
