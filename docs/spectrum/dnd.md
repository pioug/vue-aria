# @vue-spectrum/dnd

Vue port baseline of `@react-spectrum/dnd`.

## Exports

- `useDragAndDrop`
- `DIRECTORY_DRAG_TYPE`

## Example

```ts
import { useDragAndDrop } from "@vue-spectrum/dnd";

const { dragAndDropHooks } = useDragAndDrop({
  getItems(keys, items) {
    return items.map((item) => ({
      "text/plain": JSON.stringify({ key: item.id, keys: Array.from(keys) }),
    }));
  },
  onDrop(event) {
    console.log(event.items);
  },
});

// Pass dragAndDropHooks into collection components that support DnD wiring.
```

## Notes

- Baseline includes composable hook wiring for draggable and droppable collection hooks using `@vue-aria/dnd` and `@vue-aria/dnd-state`.
- `dragAndDropHooks` is enabled lazily based on provided options (`getItems` for drag, drop callbacks for drop).
- Advanced React Spectrum preview/component integration parity remains in progress.
