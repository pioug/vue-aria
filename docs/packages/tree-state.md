# @vue-stately/tree

`@vue-stately/tree` ports the upstream `@react-stately/tree` primitives for flattened tree collections, expanded-key state, and selection manager wiring used by tree/gridlist consumers.

## Reference sources

- `@react-stately/tree` source (`src/*`)
- `@react-stately/tree` docs (`docs/useTreeState.mdx`)
- `@react-stately/tree` story interactions (`stories/useTreeState.stories.tsx`)
- `@react-stately/tree` tests (`test/useTreeState.test.js`)

## API

- `TreeCollection`
- `useTreeState`

## Interface

`useTreeState` exposes the same core state surface expected by upstream consumers:

- `collection` of currently visible tree nodes (flattened by expansion state)
- `expandedKeys`, `setExpandedKeys`, `toggleKey`
- `selectionManager` for focus/selection behavior
- `disabledKeys` and selection/expansion guard behavior

## Examples

### Collection-driven state

```ts
import { TreeCollection, useTreeState } from "@vue-stately/tree";

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

### Item-data builder callbacks

```ts
import { useTreeState } from "@vue-stately/tree";

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

### Downstream composition with `@vue-aria/tree`

```ts
import { useTree } from "@vue-aria/tree";
import { useTreeState } from "@vue-stately/tree";

const treeRef = { current: null as HTMLElement | null };

const state = useTreeState({
  selectionMode: "single",
  items: [{ id: "animals", label: "Animals", children: [{ id: "bear", label: "Bear" }] }],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label,
  getChildren: (item) => item.children,
  defaultExpandedKeys: ["animals"],
});

const { gridProps } = useTree({ "aria-label": "Example tree" }, state, treeRef);
void gridProps;
```

## Notes

- State package is non-visual; no dedicated base style assets are required.
- Keyboard navigation, expansion/collapse semantics, and row ARIA metadata parity are validated through downstream `@vue-aria/tree` interaction suites.
- `Spectrum S2` is out of scope unless explicitly requested.
