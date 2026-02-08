# @vue-aria/overlays-state

State primitives for overlay triggers.

## `useOverlayTriggerState`

Tracks controlled/uncontrolled overlay visibility and exposes state actions.

```ts
import { useOverlayTriggerState } from "@vue-aria/overlays-state";

const state = useOverlayTriggerState({
  defaultOpen: false,
});

state.open();
state.close();
state.toggle();
```
