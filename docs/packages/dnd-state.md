# @vue-aria/dnd-state

State primitives aligned with React Stately's drag and drop package.

## `useDraggableCollectionState`

Builds draggable collection state:

- computes keys to drag (selected keys with child-key filtering)
- exposes drag lifecycle methods (`startDrag`, `moveDrag`, `endDrag`)
- bridges drag payload creation via `getItems`

```ts
import { useDraggableCollectionState } from "@vue-aria/dnd-state";

const state = useDraggableCollectionState({
  collection,
  selectionManager,
  getItems: (keys, values) =>
    values.map((value) => ({ "text/plain": String(value) })),
});
```

## `useDroppableCollectionState`

Builds droppable collection state:

- tracks and normalizes active drop targets
- computes valid drop operations from accepted types and handlers
- emits enter/exit callbacks when targets change

```ts
import { useDroppableCollectionState } from "@vue-aria/dnd-state";

const state = useDroppableCollectionState({
  collection,
  selectionManager,
  acceptedDragTypes: ["text/plain"],
  onItemDrop: (event) => {
    console.log(event.target);
  },
});
```
