# @vue-aria/virtualizer

Composable helpers aligned with React Aria virtualizer behavior.

## Exports

- `Virtualizer`
- `ScrollView`
- `VirtualizerItem`
- `useVirtualizer`
- `useScrollView`
- `useVirtualizerItem`
- `layoutInfoToStyle`
- `getRTLOffsetType`
- `getScrollLeft`
- `setScrollLeft`

`useScrollView` includes scroll lifecycle hooks, immediate measurement when refs attach, and border-box resize observation to keep visible-rect updates aligned with React Aria behavior.

```ts
import { getScrollLeft, useVirtualizerItem } from "@vue-aria/virtualizer";

const left = getScrollLeft(container, "rtl");
```
