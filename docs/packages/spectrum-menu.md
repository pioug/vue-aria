# @vue-spectrum/menu - Menu

`Menu` and `MenuTrigger` render Spectrum-style action menus.

## Example

```vue
<script setup lang="ts">
import { ActionButton } from "@vue-spectrum/button";
import { Item, Menu, MenuTrigger } from "@vue-spectrum/menu";
</script>

<template>
  <MenuTrigger>
    <ActionButton>Actions</ActionButton>
    <Menu aria-label="File actions">
      <Item key="copy">Copy</Item>
      <Item key="duplicate">Duplicate</Item>
      <Item key="delete">Delete</Item>
    </Menu>
  </MenuTrigger>
</template>
```

## Sections

```vue
<template>
  <Menu aria-label="Sectioned menu">
    <Section title="Edit">
      <Item key="undo">Undo</Item>
      <Item key="redo">Redo</Item>
    </Section>
    <Section title="Clipboard">
      <Item key="copy">Copy</Item>
      <Item key="paste">Paste</Item>
    </Section>
  </Menu>
</template>
```

## ActionMenu

```vue
<script setup lang="ts">
import { ActionMenu, Item } from "@vue-spectrum/menu";
</script>

<template>
  <ActionMenu @action="(key) => console.log(key)">
    <Item key="rename">Rename</Item>
    <Item key="share">Share</Item>
    <Item key="archive">Archive</Item>
  </ActionMenu>
</template>
```

## Submenus

```vue
<template>
  <MenuTrigger>
    <ActionButton>Open menu</ActionButton>
    <Menu aria-label="Root menu">
      <SubmenuTrigger>
        <Item key="more">More…</Item>
        <Menu aria-label="Nested menu">
          <Item key="details">Details</Item>
        </Menu>
      </SubmenuTrigger>
      <Item key="close">Close</Item>
    </Menu>
  </MenuTrigger>
</template>
```

## Accessibility

- Root content uses `role="menu"`.
- Items expose `menuitem`, `menuitemradio`, or `menuitemcheckbox` roles based on selection mode.
- `MenuTrigger` sets `aria-haspopup`, `aria-expanded`, and `aria-controls` on the trigger.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
