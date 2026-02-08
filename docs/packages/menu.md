# @vue-aria/menu

Menu trigger, menu, and menu item accessibility primitives.

## `useMenuTriggerState`

State adapter for menu open/close and focus strategy.

## `useMenuTrigger`

Provides trigger/menu wiring (`aria-haspopup`, `aria-expanded`, keyboard open behavior).

## `useMenu`

Provides menu semantics, keyboard navigation, and typeahead.

## `useMenuItem`

Provides menu item semantics, selection behavior, action dispatch, and close behavior.

## `useMenuSection`

Provides section heading/group semantics for grouped menu content.

```ts
import {
  useMenuTriggerState,
  useMenuTrigger,
  useMenu,
  useMenuItem,
  useMenuSection,
} from "@vue-aria/menu";
```
