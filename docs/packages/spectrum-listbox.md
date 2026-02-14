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

```vue
<template>
  <ListBox
    aria-label="Status filter"
    selection-mode="single"
    :default-selected-keys="['active']"
  >
    <Item key="all">All</Item>
    <Item key="active">Active</Item>
    <Item key="archived">Archived</Item>
  </ListBox>
</template>
```

Selection checkmarks render only when `selectionMode` is set.

## Keyboard Navigation

```vue
<template>
  <ListBox
    aria-label="Wrapped navigation"
    :should-focus-wrap="true"
  >
    <Item key="a">Alpha</Item>
    <Item key="b">Beta</Item>
    <Item key="c">Gamma</Item>
  </ListBox>
</template>
```

With `shouldFocusWrap`, arrow-key navigation wraps between first and last options.

## Key Handling

`ListBox` supports section/item keys that are numeric or empty-string values in addition to typical string keys.

## Accessibility

- Root uses `role="listbox"`.
- Options use `role="option"` and `aria-selected` for selectable modes.
- Section groups use `role="group"` with heading labeling.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
