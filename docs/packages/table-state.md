# @vue-aria/table-state

State management for table collections, row selection, and sort state.

## `useTableState`

Provides:

- table collection traversal (`getFirstKey`, `getKeyAfter`, `getTextValue`)
- selection manager for row selection state
- sort descriptor helpers with toggle behavior

```ts
import { useTableState } from "@vue-aria/table-state";

const state = useTableState({
  columns: [{ key: "name", isRowHeader: true }, { key: "type" }],
  collection: [
    { key: "1", cells: [{ textValue: "Bear" }, { textValue: "Mammal" }] },
  ],
  selectionMode: "multiple",
});

state.selectionManager.select("1");
state.sort("name");
```
