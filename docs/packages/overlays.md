# @vue-aria/overlays

Overlay accessibility primitives.

## `useOverlayTrigger`

Provides trigger and overlay ARIA wiring (haspopup, expanded, controls).

## `useOverlay`

Provides overlay dismissal behavior for outside interaction, Escape key, and
optional blur-dismiss semantics.

## `useOverlayPosition`

Positions overlays relative to a trigger, supports flip/cross-offset behavior,
and exposes arrow positioning metadata.

## `useModal`

Provides modal semantics (`data-ismodal`) and parent-provider `aria-hidden`
coordination for nested modal stacks.

## `useModalOverlay`

Composes overlay dismissal, scroll locking, and outside-content hiding for modal
underlay/content pairs.

```ts
import { useOverlayPosition, useOverlayTrigger } from "@vue-aria/overlays";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";

const state = useOverlayTriggerState();
const { triggerProps, overlayProps } = useOverlayTrigger(
  { type: "menu" },
  state
);

const { overlayProps: positionProps } = useOverlayPosition({
  targetRef: triggerElement,
  overlayRef: overlayElement,
});
```
