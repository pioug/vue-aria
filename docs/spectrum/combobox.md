# @vue-spectrum/combobox

Vue port baseline of `@react-spectrum/combobox`.

<script setup lang="ts">
import { ref } from "vue";
import { ComboBox } from "@vue-spectrum/vue-spectrum";

const selection = ref<string | null>(null);

const items = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 12px; max-width: 360px;">
    <ComboBox
      label="Numbers"
      :items="items"
      :onSelectionChange="(key) => (selection = key ? String(key) : null)" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      {{ selection ? `selected -> ${selection}` : "No selection" }}
    </p>
  </div>
</div>

## Exports

- `ComboBox`

## Example

```ts
import { h } from "vue";
import { ComboBox } from "@vue-spectrum/combobox";

const component = h(ComboBox, {
  label: "Fruits",
  items: [
    { key: "apple", label: "Apple" },
    { key: "orange", label: "Orange" },
    { key: "pear", label: "Pear" },
  ],
  onSelectionChange: (key) => {
    console.log("selected", key);
  },
});
```

## Notes

- Baseline includes combobox/input/listbox ARIA wiring, type-to-filter behavior, button-trigger opening, and selection commit behavior.
- Controlled/uncontrolled `selectedKey`, `inputValue`, and open-state flows are wired through `@vue-aria/combobox-state`.
- Advanced popover positioning/mobile tray behavior, sections, async loading UX parity, and full visual/theming parity remain in progress.
