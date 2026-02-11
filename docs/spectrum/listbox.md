# @vue-spectrum/listbox

Vue port baseline of `@react-spectrum/listbox`.

<script setup lang="ts">
import { ref } from "vue";
import { ListBox } from "@vue-spectrum/vue-spectrum";

const items = [
  {
    key: "fruit",
    heading: "Fruits",
    items: [
      { key: "apple", label: "Apple" },
      { key: "banana", label: "Banana" },
      { key: "orange", label: "Orange" },
    ],
  },
  {
    key: "vegetable",
    heading: "Vegetables",
    items: [
      { key: "carrot", label: "Carrot" },
      { key: "broccoli", label: "Broccoli" },
    ],
  },
];

const events = ref<string[]>([]);

function onSelectionChange(keys: Set<string | number>) {
  events.value = [`selection -> ${Array.from(keys).join(", ")}`].slice(0, 1);
}
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 12px; max-width: 320px;">
    <ListBox
      aria-label="Produce"
      :items="items"
      selectionMode="single"
      :defaultSelectedKeys="['banana']"
      :onSelectionChange="onSelectionChange"
      autoFocus="first" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      {{ events[0] ?? "Select an option" }}
    </p>
  </div>
</div>

## Exports

- `ListBox`
- `ListBoxBase`
- `useListBoxLayout`
- `ListBoxOption`
- `ListBoxSection`

## Example

```ts
import { h } from "vue";
import { ListBox } from "@vue-spectrum/listbox";

const component = h(ListBox, {
  "aria-label": "Options",
  selectionMode: "single",
  items: [
    {
      key: "section-1",
      heading: "Section",
      items: [
        { key: "a", label: "Option A" },
        { key: "b", label: "Option B", isDisabled: true },
      ],
    },
  ],
  onSelectionChange: (keys) => {
    console.log(Array.from(keys));
  },
});
```

## Notes

- Baseline includes section rendering (`group` + heading semantics), keyboard navigation, wrap-focus support, single/multiple selection behavior, and static slot composition support via `ListBoxOption` and `ListBoxSection`.
- Loading and empty-state rendering hooks are included via `isLoading`, `showLoadingSpinner`, `onLoadMore`, and `renderEmptyState`.
- Advanced virtualizer layout/measurement parity and full visual/theming parity remain in progress.
