# @vue-stately/grid

`@vue-stately/grid` ports upstream `@react-stately/grid` collection and selection state helpers for grid-style data structures.

## Implemented modules

- `useGridState`
- `GridCollection`

## Upstream-aligned example

```ts
import { GridCollection, useGridState } from "@vue-stately/grid";

const collection = new GridCollection({
  columnCount: 2,
  items: [
    {
      type: "item",
      key: "row-1",
      childNodes: [
        { type: "cell", key: "r1c1", childNodes: [], hasChildNodes: false, index: 0 },
        { type: "cell", key: "r1c2", childNodes: [], hasChildNodes: false, index: 1 },
      ],
    },
  ],
});

const state = useGridState({
  collection,
  selectionMode: "single",
  focusMode: "cell",
});
```

## Notes

- `focusMode: "cell"` maps row focus to first/last child cell, mirroring upstream behavior.
- This package is non-visual state logic; no base styles are required.
- `Spectrum S2` is out of scope unless explicitly requested.
