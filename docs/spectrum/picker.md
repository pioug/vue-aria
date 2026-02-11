# @vue-spectrum/picker

Vue port baseline of `@react-spectrum/picker`.

<script setup lang="ts">
import { Picker } from "@vue-spectrum/vue-spectrum";

const options = [
  { key: "one", label: "One" },
  { key: "two", label: "Two" },
  { key: "three", label: "Three" },
];
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 360px;">
    <Picker
      aria-label="Example picker"
      :items="options" />
  </div>
</div>

## Exports

- `Picker`
- `PickerItem`
- `PickerSection`

## Example

```ts
import { h } from "vue";
import { Picker } from "@vue-spectrum/picker";

const component = h(Picker, {
  "aria-label": "Example picker",
  items: [
    { key: "one", label: "One" },
    { key: "two", label: "Two" },
    { key: "three", label: "Three" },
  ],
  onSelectionChange: (key) => {
    console.log("selected", key);
  },
});
```

## Notes

- Baseline includes trigger + listbox behavior (open/close, keyboard navigation, selection callbacks, controlled/uncontrolled selection, and trigger-anchored popover placement), plus static slot composition via `PickerItem` and `PickerSection`.
- Mobile tray rendering is included when running on mobile screen widths.
- Async loading baseline is included via `isLoading` spinner handling, `onLoadMore` scroll-threshold callbacks, and loading-progress `aria-describedby` wiring on the trigger.
- Basic form wiring is included via hidden-input submission/reset support (`name`, `form`, `defaultSelectedKey` reset behavior).
- Basic validation semantics are included via `isRequired`, `isInvalid`, and `validationState` wiring to ARIA/class output.
- Advanced parity work for full validation/deep form integration remains in progress.
