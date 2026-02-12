# @vue-spectrum/menu

Vue port baseline of `@react-spectrum/menu`.

<script setup lang="ts">
import { MenuTrigger } from "@vue-spectrum/vue-spectrum";

const menuItems = [
  { key: "edit", label: "Edit" },
  { key: "copy", label: "Copy" },
  { key: "delete", label: "Delete" },
];
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 420px;">
    <MenuTrigger
      triggerLabel="Menu"
      :items="menuItems" />
  </div>
</div>

## Exports

- `Menu`
- `MenuSection`
- `MenuItem`
- `Item` (alias of `MenuItem` for v1 compatibility)
- `Section` (alias of `MenuSection` for v1 compatibility)
- `SubmenuTrigger`
- `ContextualHelpTrigger`
- `MenuTrigger`
- `ActionMenu`

## Example

```ts
import { h } from "vue";
import { MenuTrigger } from "@vue-spectrum/menu";

const component = h(MenuTrigger, {
  triggerLabel: "Menu",
  items: [
    { key: "edit", label: "Edit" },
    { key: "copy", label: "Copy" },
    { key: "delete", label: "Delete" },
  ],
  onAction: (key) => {
    console.log("action", key);
  },
});
```

## Notes

- Baseline includes menu and trigger behavior with keyboard navigation, selection modes (`none`/`single`/`multiple`), section grouping support (`sections` + `MenuSection`), submenu trigger behavior (`SubmenuTrigger`), close-on-select behavior for pointer and keyboard item activation flows, and tab-key focus retention while open.
- Package also exports upstream-compatible `Item`/`Section` aliases for React Spectrum-style menu composition, including static slot syntax.
- `MenuTrigger` baseline supports both prop-driven usage and upstream-style static composition (`trigger + Menu` children).
- `SubmenuTrigger` baseline supports both prop-driven usage and upstream-style static composition (`trigger + Menu` children).
- Baseline includes accessibility guardrails from upstream behavior: runtime warning when neither `aria-label` nor `aria-labelledby` is provided to `Menu`, plus section/item `aria-label` semantics for grouped/icon-style menus.
- Baseline includes trigger-anchored popover positioning support (`placement`) for `MenuTrigger` and `ActionMenu`.
- Baseline `ActionMenu` parity includes default/custom trigger ARIA labeling (locale-aware `More actions` fallback), `aria-labelledby` precedence wiring, trigger-id-to-menu `aria-labelledby` linkage, controlled/uncontrolled open-state behavior, disabled handling, and `autoFocus`.
- Baseline includes `ContextualHelpTrigger` integration for static menu composition: unavailable items open contextual-help dialogs and suppress menu action callbacks while keeping regular item behavior when available.
- Baseline includes custom overlay container targeting for `MenuTrigger`/`ActionMenu` via `container`.
- Baseline contextual-help support includes click, hover, and `ArrowRight` opening for unavailable items, and closes when moving hover/focus to another menu item.
- Contextual-help hover/`ArrowRight` opening is gated to unavailable items (`isUnavailable=true`) and does not open for available items.
- Baseline contextual-help support includes an unavailable indicator icon on unavailable contextual-help items.
- Baseline submenu behavior includes Escape-key close without firing submenu `onClose` callbacks.
- Baseline submenu keyboard behavior now uses locale-aware arrow semantics (`ArrowRight`/`ArrowLeft` swap in RTL) for open/close handling.
- Baseline submenu behavior keeps only one sibling submenu open at a time.
- Baseline submenu behavior supports hover-open interactions, hover-leave closing to neighboring items, and keeps submenu open when pointer moves between trigger and submenu content.
- Baseline submenu behavior does not fire `onAction` when activating submenu-trigger items.
- Baseline submenu behavior fires submenu `onClose` callbacks when closing from item selection.
- Baseline submenu behavior supports submenu `selectionMode`/`onSelectionChange`, does not treat trigger activation as submenu selection, and supports combined submenu `onAction` + `onClose` callback wiring on option selection.
- Baseline submenu behavior propagates disabled state from static trigger `Item` content and disabled-key membership (`disabledKeys`) for static trigger keys (disabled trigger does not open on hover/click/keyboard).
- Baseline submenu behavior closes when focus leaves submenu scope to neighboring items and retains focus within submenu content on `Tab` key handling.
- Includes upstream-style submenu parity suite naming (`SubMenuTrigger.test`).
- Advanced contextual-help parity (additional upstream submenu close edge-cases and icon/overlay visual parity) remains in progress.
