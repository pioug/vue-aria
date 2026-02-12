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
- `Collection`
- `ListViewItem`
- `Item` (alias of `ListViewItem` for v1 compatibility)

## Example

```vue
<script setup lang="ts">
import { ListView } from "@vue-spectrum/list";
</script>

<template>
  <ListView />
</template>
```

## Notes

- Baseline includes grid/list semantics (`grid` + `row` + `gridcell`), keyboard row navigation, single/multiple selection behavior, static slot composition support via `ListViewItem`, row focus marshalling on cell press, and row child-action focus cycling via `ArrowLeft`/`ArrowRight` (including RTL ordering).
- Package also exports `Collection` and `Item` compatibility helpers for React Spectrum-style item composition.
- Loading/empty-state rendering and scroll-bottom `onLoadMore` behavior are included, with locale-aware loading progress labels, and disabled rows now propagate `disabled` state to nested native controls.
- Advanced upstream drag-and-drop integration and complete visual/theming parity remain in progress.
