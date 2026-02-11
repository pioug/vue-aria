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
- `Item` (alias of `ActionGroupItem` for v1 compatibility)

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
- Package also exports upstream-compatible `Item` alias for React Spectrum-style composition.
- Baseline now includes overflow collapse/menu behavior (`overflowMode="collapse"`), including collapsing all items into the menu when selection mode is enabled and not all items fit.
- When fully collapsed, aria labeling props are forwarded to the overflow menu trigger (`aria-label` / `aria-labelledby`).
- Baseline includes `buttonLabelBehavior="hide"` wiring (`spectrum-ActionGroup-item--iconOnly` with aria-label fallback for accessibility).
- Baseline includes `buttonLabelBehavior="collapse"` behavior: labels collapse to icon-only buttons before overflowing when possible, and labels restore when space increases.
- Advanced visual/theming parity for collapsed-label presentation remains in progress.
