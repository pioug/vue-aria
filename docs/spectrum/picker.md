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
- Trigger autofocus baseline is included via `autoFocus`.
- Mobile tray rendering is included when running on mobile screen widths.
- Async loading baseline is included via `isLoading` spinner handling, `onLoadMore` scroll-threshold callbacks, loading-progress `aria-describedby` wiring on the trigger, and explicit loading labels (`Loading…`, `Loading more…`).
- Basic form wiring is included via hidden-input submission/reset support (`name`, `form`, `defaultSelectedKey` reset behavior).
- Baseline now includes validation behavior parity across `aria` and `native` modes: `validate(value)` support, function-style `errorMessage` customizers with validation context, and `Form.validationErrors` integration by field `name` with clear-on-selection behavior.
- Native-mode baseline includes required/custom-validity wiring on the hidden form input, `checkValidity` invalid-message display/focus behavior, and reset clearing behavior.
