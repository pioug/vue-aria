# @vue-spectrum/list

Vue port baseline of `@react-spectrum/list`.

<script setup lang="ts">
import { ref } from "vue";
import { ListView } from "@vue-spectrum/vue-spectrum";

const items = [
  { key: "foo", label: "Foo" },
  { key: "bar", label: "Bar" },
  { key: "baz", label: "Baz" },
];

const events = ref<string[]>([]);

function onSelectionChange(keys: Set<string | number>) {
  events.value = [`selection -> ${Array.from(keys).join(", ")}`].slice(0, 1);
}
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 12px; max-width: 360px;">
    <ListView
      aria-label="List"
      :items="items"
      selectionMode="single"
      :defaultSelectedKeys="['bar']"
      :onSelectionChange="onSelectionChange" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      {{ events[0] ?? "Select a row" }}
    </p>
  </div>
</div>

## Exports

- `ListView`
- `ListViewItem`
- `Item` (alias of `ListViewItem` for v1 compatibility)

## Example

```ts
import { h } from "vue";
import { ListView } from "@vue-spectrum/list";

const component = h(ListView, {
  "aria-label": "List",
  selectionMode: "multiple",
  items: [
    { key: "foo", label: "Foo" },
    { key: "bar", label: "Bar", isDisabled: true },
    { key: "baz", label: "Baz" },
  ],
  onSelectionChange: (keys) => {
    console.log(Array.from(keys));
  },
});
```

## Notes

- Baseline includes grid/list semantics (`grid` + `row` + `gridcell`), keyboard row navigation, single/multiple selection behavior, and static slot composition support via `ListViewItem`.
- Package also exports `Item` as a compatibility alias for upstream React Spectrum examples.
- Loading/empty-state rendering and scroll-bottom `onLoadMore` behavior are included.
- Advanced upstream child-action focus model, full drag-and-drop integration, and complete visual/theming parity remain in progress.
