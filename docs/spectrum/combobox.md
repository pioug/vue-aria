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
- `ComboBoxItem`
- `ComboBoxSection`
- `Item` (alias of `ComboBoxItem` for v1 compatibility)
- `Section` (alias of `ComboBoxSection` for v1 compatibility)

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

- Baseline includes combobox/input/listbox ARIA wiring, type-to-filter behavior, button-trigger opening plus `menuTrigger="focus"` open behavior, keyboard-open parity (`ArrowUp` opens with the last option focused) with manual-trigger `onOpenChange` callback semantics, no-match menu suppression (including close-after-open when filtering to zero results), `menuTrigger="manual"` typing behavior, `menuTrigger="focus"` clear-input reopen behavior, readonly keyboard-open suppression with value retention, selection commit behavior (including Enter-close behavior when the focused option is already selected), NVDA parity behavior where Left/Right clears `aria-activedescendant`, disabled-key filtering semantics (disabled matches remain unfocused), controlled `inputValue` and `selectedKey` prop update behavior, explicit `onBlur` callback coverage, placeholder deprecation warning parity, native form wiring (`name`/`form`) plus `formValue="key"` hidden-input submission behavior, form reset behavior (including `defaultSelectedKey` reset), component-ref parity (`UNSAFE_getDOMNode` + `focus()`), root `data-*` passthrough support, and static slot composition support via `ComboBoxItem` and `ComboBoxSection`.
- Package also exports upstream-compatible `Item`/`Section` aliases for React Spectrum-style composition.
- Controlled/uncontrolled `selectedKey`, `inputValue`, and open-state flows are wired through `@vue-aria/combobox-state`.
- Baseline now includes grouped-section listbox semantics for slot-defined `ComboBoxSection` content (headings + `role="group"` containers) with filtering-aware section rendering.
- Async loading labels now follow provider locale for both input and listbox spinners (including loading placeholder text).
- Advanced popover positioning/mobile tray behavior, full async loading UX parity, and full visual/theming parity remain in progress.
