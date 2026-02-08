# @vue-aria/menu

Menu trigger, menu, and menu item accessibility primitives.

## `useMenuTriggerState`

State adapter for menu open/close and focus strategy.

## `useSubmenuTriggerState`

Submenu state adapter layered on top of root menu trigger state.

## `useMenuTrigger`

Provides trigger/menu wiring (`aria-haspopup`, `aria-expanded`, keyboard open behavior).

## `useMenu`

Provides menu semantics, keyboard navigation, and typeahead.

## `useMenuItem`

Provides menu item semantics, selection behavior, action dispatch, and close behavior.

## `useMenuSection`

Provides section heading/group semantics for grouped menu content.

## `useSubmenuTrigger`

Provides submenu trigger keyboard/press/hover behaviors plus submenu/popover wiring.

```ts
import {
  useMenuTriggerState,
  useSubmenuTriggerState,
  useMenuTrigger,
  useMenu,
  useMenuItem,
  useMenuSection,
  useSubmenuTrigger,
} from "@vue-aria/menu";
```
