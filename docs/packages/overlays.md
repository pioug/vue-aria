# @vue-aria/overlays

Overlay accessibility primitives.

## `useOverlayTrigger`

Provides trigger and overlay ARIA wiring (haspopup, expanded, controls).

## `useOverlay`

Provides overlay dismissal behavior for outside interaction, Escape key, and
optional blur-dismiss semantics.

```ts
import { useOverlayTrigger } from "@vue-aria/overlays";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";

const state = useOverlayTriggerState();
const { triggerProps, overlayProps } = useOverlayTrigger(
  { type: "menu" },
  state
);
```
