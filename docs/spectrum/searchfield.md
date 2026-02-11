# @vue-spectrum/searchfield

Vue port baseline of `@react-spectrum/searchfield`.

<script setup lang="ts">
import { SearchField } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 420px;">
    <SearchField label="Search docs" defaultValue="keyboard navigation" />
  </div>
</div>

## Exports

- `SearchField`

## Example

```ts
import { h } from "vue";
import { SearchField } from "@vue-spectrum/searchfield";

const field = h(SearchField, {
  label: "Search",
  description: "Use keywords to filter results.",
  onSubmit: (value) => {
    console.log("submit", value);
  },
});
```

## Notes

- Baseline includes `useSearchField` semantics: Enter submit handling, Escape clearing, clear-button interaction, and controlled/uncontrolled value behavior.
- Includes parity placeholder deprecation warning behavior from upstream `@react-spectrum/searchfield`.
- `excludeFromTabOrder`, description/error wiring, and SSR coverage are included.
- Advanced upstream visual polish and icon/theming parity remain in progress.
