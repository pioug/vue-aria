# @vue-spectrum/tree

Vue port baseline of `@react-spectrum/tree`.

<script setup lang="ts">
import { ref } from "vue";
import { TreeView } from "@vue-spectrum/vue-spectrum";

const selected = ref("none");

const items = [
  {
    id: "documents",
    name: "Documents",
    childItems: [
      { id: "project-a", name: "Project A" },
      { id: "document-1", name: "Document 1" },
    ],
  },
  {
    id: "photos",
    name: "Photos",
  },
];
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 12px; max-width: 520px;">
    <TreeView
      aria-label="Files"
      :items="items"
      selectionMode="single"
      :defaultExpandedKeys="['documents']"
      :onSelectionChange="(keys) => (selected = Array.from(keys).join(', ') || 'none')" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      selection -> {{ selected }}
    </p>
  </div>
</div>

## Exports

- `TreeView`
- `TreeViewItem`
- `TreeViewItemContent`

## Example

```ts
import { h } from "vue";
import { TreeView } from "@vue-spectrum/tree";

const component = h(TreeView, {
  "aria-label": "Tree",
  selectionMode: "multiple",
  defaultExpandedKeys: ["documents"],
  items: [
    {
      id: "documents",
      name: "Documents",
      childItems: [
        { id: "project-a", name: "Project A" },
        { id: "document-1", name: "Document 1" },
      ],
    },
    { id: "photos", name: "Photos" },
  ],
  onSelectionChange: (keys) => {
    console.log(Array.from(keys));
  },
});
```

## Notes

- Baseline includes treegrid semantics, expandable nested rows, row keyboard navigation, and controlled/uncontrolled selection and expansion state.
- The baseline currently focuses on item-prop rendering (`items`/`childItems`); richer static composition parity for `TreeViewItem` slot trees remains in progress.
- Advanced upstream parity such as drag-and-drop integration, deep collection composition, and full visual/theming alignment remains in progress.
