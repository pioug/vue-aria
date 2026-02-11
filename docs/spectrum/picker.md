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
- Async loading baseline is included via `isLoading` spinner handling and `onLoadMore` scroll-threshold callbacks.
- Advanced parity work for tray/mobile variants and full form/validation integration remains in progress.
