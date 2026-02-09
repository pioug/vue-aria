# @vue-aria/dnd

Drag-and-drop clipboard primitives aligned with React Aria's `@react-aria/dnd` data model.

## `useClipboard`

Handles focused copy/cut/paste interactions and normalizes clipboard payloads for multi-type and multi-item transfers.

## `useDrag`

Provides native drag lifecycle wiring (`dragstart`/`drag`/`dragend`) with data transfer population, allowed drop operation mapping, and managed keyboard/virtual drag initiation (`Enter`, virtual clicks, and modality-aware descriptions).

## `useDrop`

Provides native drop target lifecycle wiring (`dragenter`/`dragover`/`dragleave`/`drop`) with operation negotiation, parsed dropped items, and keyboard registration for managed drag sessions.

## `useVirtualDrop`

Provides keyboard/virtual drop affordance props, including modality-specific `aria-describedby` guidance (`Press Enter`, `Double tap`, or `Click`) during active drag sessions.

## `useAutoScroll`

Provides edge-triggered scrolling logic for scrollable containers while dragging.

## `useDraggableCollection`

Tracks the currently dragged collection reference in shared DnD state when collection dragging keys are active.

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
