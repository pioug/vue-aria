# @vue-spectrum/listbox - ListBox

`ListBox` renders selectable option lists with Spectrum menu/listbox semantics.

## Example

```vue
<script setup lang="ts">
import { Item, ListBox, Section } from "@vue-spectrum/listbox";
</script>

<template>
  <ListBox aria-label="Choose one" selection-mode="single">
    <Section title="Favorites">
      <Item key="vue">Vue</Item>
      <Item key="svelte">Svelte</Item>
    </Section>
    <Section title="Other">
      <Item key="react">React</Item>
    </Section>
  </ListBox>
</template>
```

## Selection

- `selectionMode="single"`
- `selectionMode="multiple"`
- `disabledKeys`

## Accessibility

- Root uses `role="listbox"`.
- Options use `role="option"` and `aria-selected` for selectable modes.
- Section groups use `role="group"` with heading labeling.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
