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

## Example

```ts
import { h } from "vue";
import { TagGroup } from "@vue-spectrum/tag";

const component = h(TagGroup, {
  "aria-label": "Project tags",
  allowsRemoving: true,
  items: [
    { key: "a", label: "Design" },
    { key: "b", label: "Research" },
    { key: "c", label: "Accessibility" },
  ],
  onRemove: (keys) => {
    console.log("remove", Array.from(keys));
  },
});
```

## Notes

- Baseline includes keyboard roving focus, RTL/LTR arrow behavior, removable tags, and grid semantics (`grid` / `row` / `gridcell`).
- Full parity for advanced features (`maxRows`, action area, and field-label/validation integration) remains in progress.
