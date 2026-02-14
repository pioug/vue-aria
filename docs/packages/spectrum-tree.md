# @vue-spectrum/tree - TreeView

`TreeView` renders hierarchical data with treegrid semantics, expansion controls, and selection behavior.

## Example

```vue
<script setup lang="ts">
import { TreeView } from "@vue-spectrum/tree";

const items = [
  { id: "photos", name: "Photos" },
  {
    id: "projects",
    name: "Projects",
    children: [
      { id: "project-1", name: "Project 1" },
      { id: "project-2", name: "Project 2" },
    ],
  },
];
</script>

<template>
  <TreeView
    aria-label="Files"
    :items="items"
    :default-expanded-keys="['projects']"
    selection-mode="single"
  />
</template>
```

## Static Composition

```vue
<script setup lang="ts">
import { TreeView, TreeViewItem, TreeViewItemContent } from "@vue-spectrum/tree";
</script>

<template>
  <TreeView aria-label="Static tree" :default-expanded-keys="['projects']">
    <TreeViewItem id="photos" text-value="Photos">
      <TreeViewItemContent>Photos</TreeViewItemContent>
    </TreeViewItem>
    <TreeViewItem id="projects" text-value="Projects">
      <TreeViewItemContent>Projects</TreeViewItemContent>
      <TreeViewItem id="project-1" text-value="Project 1">
        <TreeViewItemContent>Project 1</TreeViewItemContent>
      </TreeViewItem>
    </TreeViewItem>
  </TreeView>
</template>
```

## Empty State

```vue
<script setup lang="ts">
import { TreeView } from "@vue-spectrum/tree";

const items: unknown[] = [];
const renderEmptyState = () => "No rows found.";
</script>

<template>
  <TreeView
    aria-label="Empty tree"
    :items="items"
    :render-empty-state="renderEmptyState"
  />
</template>
```

## Highlight Selection

```vue
<script setup lang="ts">
import { TreeView } from "@vue-spectrum/tree";

const items = [
  { id: "alpha", name: "Alpha" },
  { id: "beta", name: "Beta" },
  { id: "gamma", name: "Gamma" },
];
</script>

<template>
  <TreeView
    aria-label="Highlight tree"
    :items="items"
    selection-mode="multiple"
    selection-style="highlight"
  />
</template>
```

## Key Props

- `selectionMode`: `"none" | "single" | "multiple"`.
- `selectionStyle`: `"highlight" | "checkbox"`.
- `renderEmptyState`: callback for empty-state row content.
- `expandedKeys` / `defaultExpandedKeys` with `onExpandedChange`.
- `selectedKeys` / `defaultSelectedKeys` with `onSelectionChange`.
- `onAction` for row action handling.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
