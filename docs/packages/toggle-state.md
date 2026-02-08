# @vue-aria/toggle-state

State primitives for toggle components like checkboxes, switches, and toggle
buttons.

## `useToggleState`

Provides controlled/uncontrolled selected state, default selected tracking,
read-only guards, and toggle actions.

```ts
import { useToggleState } from "@vue-aria/toggle-state";

const state = useToggleState({
  defaultSelected: true,
});

state.toggle();
state.setSelected(false);
```
