# @vue-aria/virtualizer-state

Foundational geometry/layout primitives for virtualized collections.

## Classes

- `Point`
- `Size`
- `Rect`
- `LayoutInfo`
- `Layout`
- `Virtualizer`
- `OverscanManager`
- `ReusableView`
- `useVirtualizerState`

```ts
import { LayoutInfo, Rect } from "@vue-aria/virtualizer-state";

const itemLayout = new LayoutInfo("item", "row-1", new Rect(0, 0, 300, 40));
const nextLayout = itemLayout.copy();
```
