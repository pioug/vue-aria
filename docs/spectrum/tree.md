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

- `Collection`
- `TreeView`
- `TreeViewItem`
- `TreeViewItemContent`

## Example

```ts
import { h } from "vue";
import { Collection, TreeView, TreeViewItem, TreeViewItemContent } from "@vue-spectrum/tree";

const component = h(TreeView, {
  "aria-label": "Tree static",
}, {
  default: () =>
    h(Collection, {
      items: [
        {
          id: "documents",
          name: "Documents",
          children: [
            { id: "project-a", name: "Project A" },
            { id: "document-1", name: "Document 1" },
          ],
        },
        { id: "photos", name: "Photos" },
      ],
    }, {
      default: ({ item }) => h(TreeViewItem, { id: item.id }, {
        default: () => [
          h(TreeViewItemContent, null, () => item.name),
          ...(item.children ?? []).map((child) =>
            h(TreeViewItem, { id: child.id }, () => child.name)
          ),
        ],
      }),
    }),
});
```

```ts
import { h } from "vue";
import { TreeView } from "@vue-spectrum/tree";

const dynamicComponent = h(TreeView, {
  "aria-label": "Tree dynamic",
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

- Baseline includes treegrid semantics, expandable nested rows, row keyboard navigation, controlled/uncontrolled selection and expansion state, and static slot composition support via `Collection`, `TreeViewItem`, and `TreeViewItemContent`.
- Advanced upstream parity such as drag-and-drop integration, deep collection composition, and full visual/theming alignment remains in progress.
