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

## `UNSAFE_PortalProvider`

Provides a portal-container context for nested overlays. Pass `getContainer`
to route overlay portals to a custom element, or pass `null` to clear a parent
portal context.

## `useUNSAFE_PortalContext`

Returns the current portal-container context (`getContainer`) used by overlay
components.

## `useModal`

Provides modal semantics (`data-ismodal`) and parent-provider `aria-hidden`
coordination for nested modal stacks.

## `useModalProvider`

Provides top-layer modal context for nested overlay trees and parent/child modal coordination.

```ts
import { useModalProvider } from "@vue-aria/overlays";

const { modalProviderProps } = useModalProvider();
```

## `useModalOverlay`

Composes overlay dismissal, scroll locking, and outside-content hiding for modal
underlay/content pairs.

## `useOverlayFocusContain`

Contains keyboard focus within an overlay and restores focus to the previously
focused element on cleanup.

## `usePreventScroll`

Prevents document scroll while overlays are active, with nested-overlay cleanup
semantics.

## `usePopover`

Composes overlay dismissal and positioning for trigger-anchored popovers, with
modal or non-modal behavior.

```ts
import {
  UNSAFE_PortalProvider,
  useOverlayPosition,
  useOverlayTrigger,
} from "@vue-aria/overlays";
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

const containerProvider = UNSAFE_PortalProvider;
```
