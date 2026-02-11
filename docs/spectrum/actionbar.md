# @vue-spectrum/actionbar

Vue port baseline of `@react-spectrum/actionbar`.

<script setup lang="ts">
import { ActionBar } from "@vue-spectrum/vue-spectrum";

const actions = [
  { key: "edit", label: "Edit" },
  { key: "copy", label: "Copy" },
  { key: "delete", label: "Delete" },
];
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 720px;">
    <ActionBar
      :selectedItemCount="2"
      :items="actions" />
  </div>
</div>

## Exports

- `ActionBar`
- `ActionBarItem`
- `ActionBarContainer`

## Example

```ts
import { h } from "vue";
import { ActionBar } from "@vue-spectrum/actionbar";

const component = h(ActionBar, {
  selectedItemCount: 2,
  items: [
    { key: "edit", label: "Edit" },
    { key: "copy", label: "Copy" },
    { key: "delete", label: "Delete" },
  ],
  onAction: (key) => {
    console.log("action", key);
  },
  onClearSelection: () => {
    console.log("clear");
  },
});
```

## Notes

- Baseline includes open/close behavior based on selection count, `ActionGroup` action wiring, clear-selection behavior (button + Escape), selected-count rendering (including retaining the last non-zero count during the close transition), live selection announcements (`role="status"`), focus restore to the pre-toolbar element on close, close-transition lifecycle/class handling, and static slot composition support via `ActionBarItem`.
- Richer animation polish and actiongroup-collapse behavior remain in progress.
