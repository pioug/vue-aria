# @vue-aria/menu

`@vue-aria/menu` ports menu accessibility hooks from upstream `@react-aria/menu`.

## Implemented modules

- `useMenu`
- `useMenuSection`
- `menuData`

## Upstream-aligned example

```vue
<script setup lang="ts">
import { useMenu, useMenuSection } from "@vue-aria/menu";
import { useListState } from "@vue-aria/list-state";

const menuRef = { current: null as HTMLElement | null };
const state = useListState({
  selectionMode: "none",
  items: [
    { id: "new", label: "New file" },
    { id: "open", label: "Open file" }
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label
});

const { menuProps } = useMenu({ "aria-label": "File actions" }, state as any, menuRef);
const { itemProps, headingProps, groupProps } = useMenuSection({ heading: "File" });
</script>
```

## Notes

- Current slice focuses on `useMenu`/`useMenuSection`; `useMenuItem`, trigger, and submenu hooks are pending.
- `Spectrum S2` is ignored for this port.
