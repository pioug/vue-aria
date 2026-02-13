# @vue-aria/menu

`@vue-aria/menu` ports menu accessibility hooks from upstream `@react-aria/menu`.

## Implemented modules

- `useMenu`
- `useMenuItem`
- `useMenuSection`
- `useMenuTrigger`
- `useSubmenuTrigger`
- `menuData`

## Upstream-aligned example

```vue
<script setup lang="ts">
import { useMenu, useMenuItem, useMenuSection, useMenuTrigger, useSubmenuTrigger } from "@vue-aria/menu";
import { useListState } from "@vue-aria/list-state";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";

const triggerRef = { current: null as HTMLElement | null };
const menuRef = { current: null as HTMLElement | null };
const triggerState = useOverlayTriggerState({});
const state = useListState({
  selectionMode: "none",
  items: [
    { id: "new", label: "New file" },
    { id: "open", label: "Open file" }
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label
});

const { menuTriggerProps, menuProps: triggerMenuProps } = useMenuTrigger({}, triggerState as any, triggerRef);
const { menuProps } = useMenu({ ...triggerMenuProps, "aria-label": "File actions" }, state as any, menuRef);
const itemRef = { current: null as HTMLElement | null };
const { menuItemProps } = useMenuItem({ key: "new" }, state as any, itemRef);
const { itemProps, headingProps, groupProps } = useMenuSection({ heading: "File" });
const submenuRef = { current: null as HTMLElement | null };
const { submenuTriggerProps, submenuProps, popoverProps } = useSubmenuTrigger({
  parentMenuRef: menuRef,
  submenuRef
}, triggerState as any, itemRef);
</script>
```

## Notes

- Current slice includes `useMenu`, `useMenuItem`, `useMenuSection`, `useMenuTrigger`, and `useSubmenuTrigger`.
- `useSafelyMouseToSubmenu` is implemented, with further parity hardening still needed for full edge-case equivalence.
- `Spectrum S2` is ignored for this port.
