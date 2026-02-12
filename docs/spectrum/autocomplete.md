# @vue-spectrum/autocomplete

Vue port baseline of `@react-spectrum/autocomplete`.

<script setup lang="ts">
import { ref } from "vue";
import { SearchAutocomplete } from "@vue-spectrum/vue-spectrum";

const submitted = ref<string>("none");

const items = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 12px; max-width: 360px;">
    <SearchAutocomplete
      label="Search numbers"
      :defaultItems="items"
      :onSubmit="(value, key) => (submitted = `${value} (${String(key)})`)" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      last submit -> {{ submitted }}
    </p>
  </div>
</div>

## Exports

- `SearchAutocomplete`
- `SearchAutocompleteItem`
- `SearchAutocompleteSection`
- `Item` (alias of `SearchAutocompleteItem` for v1 compatibility)
- `Section` (alias of `SearchAutocompleteSection` for v1 compatibility)

## Example

```ts
import { h } from "vue";
import { SearchAutocomplete } from "@vue-spectrum/autocomplete";

const component = h(SearchAutocomplete, {
  label: "Search with suggestions",
  defaultItems: [
    { key: "aardvark", label: "Aardvark" },
    { key: "kangaroo", label: "Kangaroo" },
    { key: "snake", label: "Snake" },
  ],
  onSubmit: (value, key) => {
    console.log("submit", value, key);
  },
});
```

## Notes

- Baseline includes combobox/search input/listbox ARIA wiring, type-to-filter behavior, clear-button semantics (including locale-aware clear-button aria labels), submit callbacks, keyboard-open parity (`ArrowUp` opens with the last option focused) with manual-trigger `onOpenChange` callback semantics, readonly arrow-key open suppression, `menuTrigger="focus"` open behavior, disabled-key filtering semantics (disabled matches remain unfocused), grouped-section listbox semantics for slot-defined `SearchAutocompleteSection` content (headings + `role="group"` containers with filtering-aware section visibility), no-match menu suppression (including close-after-open when filtering to zero results), `menuTrigger="manual"` typing behavior, `menuTrigger="focus"` clear-input reopen behavior, placeholder deprecation warning parity, native form wiring (`name`/`form`) with form-reset behavior (including `defaultInputValue` restore), component-ref parity (`UNSAFE_getDOMNode` + `focus()`), selection commit behavior (including Enter-close behavior when the focused option is already selected), NVDA parity behavior where Left/Right clears `aria-activedescendant`, and static slot composition support via `SearchAutocompleteItem` and `SearchAutocompleteSection`.
- Package also exports upstream-compatible `Item`/`Section` aliases for React Spectrum-style composition.
- Controlled/uncontrolled `selectedKey`, `inputValue`, and open-state flows are wired through `@vue-aria/combobox-state`.
- Loading indicators and scroll-bottom `onLoadMore` behavior are included for async suggestion lists.
- Advanced popover/mobile tray behavior and full visual/theming parity remain in progress.
