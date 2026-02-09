# @vue-aria/dnd

Drag-and-drop clipboard primitives aligned with React Aria's `@react-aria/dnd` data model.

## `useClipboard`

Handles focused copy/cut/paste interactions and normalizes clipboard payloads for multi-type and multi-item transfers.

## `useDrag`

Provides native drag lifecycle wiring (`dragstart`/`drag`/`dragend`) with data transfer population, allowed drop operation mapping, and managed keyboard/virtual drag initiation (`Enter`, virtual clicks, and modality-aware descriptions).

## `useDrop`

Provides native drop target lifecycle wiring (`dragenter`/`dragover`/`dragleave`/`drop`) with operation negotiation, parsed dropped items, and keyboard registration for managed drag sessions.

## `useDropIndicator`

Provides keyboard drop-indicator semantics used between items in list/grid collection layouts.

## `useDroppableCollection`

Coordinates collection-level drop behavior, including virtual/keyboard target traversal and drop event normalization.

## `useDroppableItem`

Adds per-item drop target behavior for collection rows/cells with before/after/on targeting.

## `useDraggableItem`

Provides item-level draggable wiring (including drag handle patterns) on top of collection drag state.

```ts
import { useDraggableItem, useDroppableItem, useDropIndicator } from "@vue-aria/dnd";

const draggable = useDraggableItem({ key: "row-1" }, state, itemRef);
const droppable = useDroppableItem({ key: "row-1" }, state, itemRef);
const indicator = useDropIndicator({ target: { type: "item", key: "row-1", dropPosition: "before" } }, state, indicatorRef);
```

## `useVirtualDrop`

Provides keyboard/virtual drop affordance props, including modality-specific `aria-describedby` guidance (`Press Enter`, `Double tap`, or `Click`) during active drag sessions.

## `useAutoScroll`

Provides edge-triggered scrolling logic for scrollable containers while dragging.

## `useDraggableCollection`

Tracks the currently dragged collection reference in shared DnD state when collection dragging keys are active.

## `useDragSession`

Exposes shared managed drag-session state for overlays/components that need drag lifecycle context.

## `useDragModality`

Exposes the current drag modality (`pointer`, `keyboard`, or `virtual`) for adaptive guidance text and interactions.

```ts
import { useDragSession, useDragModality } from "@vue-aria/dnd";

const session = useDragSession();
const modality = useDragModality();
```

## Utilities

- `writeToDataTransfer`
- `readFromDataTransfer`
- `DragTypes`
- `DIRECTORY_DRAG_TYPE`
- `navigate` (drop-target keyboard traversal)
- `ListDropTargetDelegate` (point-to-drop-target mapping)

```ts
import { useClipboard } from "@vue-aria/dnd";

const { clipboardProps } = useClipboard({
  getItems: () => [{ "text/plain": "hello world" }],
  onPaste: async (items) => {
    if (items[0]?.kind === "text") {
      console.log(await items[0].getText("text/plain"));
    }
  },
});
```
