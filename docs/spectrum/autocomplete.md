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

- Baseline includes combobox/search input/listbox ARIA wiring, type-to-filter behavior, clear-button semantics, submit callbacks, grouped-section listbox semantics for slot-defined `SearchAutocompleteSection` content (headings + `role="group"` containers with filtering-aware section visibility), and static slot composition support via `SearchAutocompleteItem` and `SearchAutocompleteSection`.
- Controlled/uncontrolled `selectedKey`, `inputValue`, and open-state flows are wired through `@vue-aria/combobox-state`.
- Loading indicators and scroll-bottom `onLoadMore` behavior are included for async suggestion lists.
- Advanced popover/mobile tray behavior and full visual/theming parity remain in progress.
