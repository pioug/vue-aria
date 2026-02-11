# @vue-spectrum/actiongroup

Vue port baseline of `@react-spectrum/actiongroup`.

<script setup lang="ts">
import { ActionGroup } from "@vue-spectrum/vue-spectrum";

const items = [
  { key: "edit", label: "Edit" },
  { key: "duplicate", label: "Duplicate" },
  { key: "share", label: "Share" },
];
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 560px;">
    <ActionGroup
      aria-label="Item actions"
      :items="items"
      selectionMode="single"
      :defaultSelectedKeys="['edit']" />
  </div>
</div>

## Exports

- `ActionGroup`
- `ActionGroupItem`

## Example

```ts
import { h } from "vue";
import { ActionGroup } from "@vue-spectrum/actiongroup";

const component = h(ActionGroup, {
  "aria-label": "Item actions",
  selectionMode: "single",
  items: [
    { key: "edit", label: "Edit" },
    { key: "duplicate", label: "Duplicate" },
    { key: "share", label: "Share" },
  ],
});
```

## Notes

- Baseline includes item rendering, single/multiple selection state handling, disabled-key behavior, arrow-key roving focus (including RTL behavior), and static slot composition support via `ActionGroupItem`.
- Baseline now includes overflow collapse/menu behavior (`overflowMode="collapse"`), including collapsing all items into the menu when selection mode is enabled and not all items fit.
- When fully collapsed, aria labeling props are forwarded to the overflow menu trigger (`aria-label` / `aria-labelledby`).
- Baseline includes `buttonLabelBehavior="hide"` wiring (`spectrum-ActionGroup-item--iconOnly` with aria-label fallback for accessibility).
- Advanced `buttonLabelBehavior="collapse"` measurement parity remains in progress.
