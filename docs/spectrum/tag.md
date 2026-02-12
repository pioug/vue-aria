# @vue-spectrum/tag

Vue port baseline of `@react-spectrum/tag`.

<script setup lang="ts">
import { TagGroup } from "@vue-spectrum/vue-spectrum";

const tags = [
  { key: "a", label: "Design" },
  { key: "b", label: "Research" },
  { key: "c", label: "Accessibility" },
];
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 720px;">
    <TagGroup
      aria-label="Project tags"
      :items="tags"
      allowsRemoving />
  </div>
</div>

## Exports

- `TagGroup`
- `Tag`
- `Item` (alias of `Tag` for v1 compatibility)

## Example

```vue
<script setup lang="ts">
import { TagGroup } from "@vue-spectrum/tag";
</script>

<template>
  <TagGroup />
</template>
```

## Notes

- Baseline includes keyboard roving focus, RTL/LTR arrow behavior, tab entry/exit with remembered tag focus (including reverse entry to the last tag), removable tags (with post-remove focus handoff to the next tag or the grid when empty), grid semantics (`grid` / `row` / `gridcell`), and static slot composition support via `Tag`.
- Package also exports upstream-compatible `Item` alias for React Spectrum-style composition.
- Baseline now includes `maxRows` collapse/expand behavior with locale-aware built-in collapse controls (`Show all`/`Show less` equivalents per locale).
- Baseline also includes an action area via `actionLabel` + `onAction`, with keyboard tab navigation across tags/actions.
- Baseline includes custom empty-state rendering via `renderEmptyState` plus locale-aware default empty-state text.
- Baseline includes data-attribute passthrough on tag items and link-style tags via `href`.
- Baseline includes static-item `UNSAFE_className` passthrough on tag rows.
- Baseline includes field semantics (`label`/`description`/`errorMessage`) and `Form.validationErrors` integration by field `name`.
- Baseline removable-tag behavior includes keyboard (`Delete`/`Backspace`) and explicit remove-button click flows, while non-remove keys (for example Space) do not remove tags.
- Advanced visual/theming parity remains in progress.
