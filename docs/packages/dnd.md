# @vue-aria/dnd

Drag-and-drop clipboard primitives aligned with React Aria's `@react-aria/dnd` data model.

## `useClipboard`

Handles focused copy/cut/paste interactions and normalizes clipboard payloads for multi-type and multi-item transfers.

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
