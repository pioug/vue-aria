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

- Baseline includes menu and trigger behavior with keyboard navigation, selection modes (`none`/`single`/`multiple`), section grouping support (`sections` + `MenuSection`), and close-on-select behavior.
- Advanced parity for sections/submenus, contextual-help/dialog triggers, and full popover positioning remains in progress.
