# @vue-aria/tree-state

`@vue-aria/tree-state` ports the upstream `@react-stately/tree` tree collection/state primitives for expanded-key and selection state management.

## Implemented modules

- `TreeCollection`
- `useTreeState`

## Upstream-aligned example (implemented slice)

```ts
import { TreeCollection, useTreeState } from "@vue-aria/tree-state";

const nodes = [] as any;
const collection = new TreeCollection(nodes, {
  expandedKeys: new Set(["animals"]),
});

const state = useTreeState({
  collection,
  selectionMode: "multiple",
  defaultExpandedKeys: ["animals"],
});

state.toggleKey("animals");
state.setExpandedKeys(new Set(["plants"]));
```

## Item-data builder example

```ts
import { useTreeState } from "@vue-aria/tree-state";

const state = useTreeState({
  selectionMode: "single",
  items: [
    {
      id: "animals",
      label: "Animals",
      children: [{ id: "aardvark", label: "Aardvark" }],
    },
    { id: "plants", label: "Plants" },
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label,
  getChildren: (item) => item.children,
  defaultExpandedKeys: ["animals"],
});
```

## Notes

- Current package status: in progress (foundational tree state + collection slice).
- This package currently focuses on composable/state parity and core collection behavior.
- `Spectrum S2` is out of scope unless explicitly requested.
