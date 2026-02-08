# @vue-aria/select

Select accessibility primitives and state adapter.

## `useSelectState`

Manages select open state, focus strategy, and selected key/item state.

## `useSelect`

Provides trigger/value/menu props and field accessibility wiring.

```ts
import { useSelectState, useSelect } from "@vue-aria/select";

const state = useSelectState({
  collection: [{ key: "apple" }, { key: "banana" }],
  defaultSelectedKey: "apple",
});

const { triggerProps, valueProps, menuProps } = useSelect(
  { "aria-label": "Fruits" },
  state,
  triggerRef
);
```
