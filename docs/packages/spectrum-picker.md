# @vue-spectrum/picker - Picker

`Picker` renders a Spectrum dropdown trigger connected to a single-select listbox.

## Example

```vue
<script setup lang="ts">
import { Picker } from "@vue-spectrum/picker";

const items = [
  { key: "vue", label: "Vue" },
  { key: "svelte", label: "Svelte" },
  { key: "react", label: "React" },
];
</script>

<template>
  <Picker aria-label="Framework" :items="items" />
</template>
```

## Slot Collection

```vue
<script setup lang="ts">
import { Item, Picker, Section } from "@vue-spectrum/picker";
</script>

<template>
  <Picker aria-label="State">
    <Section title="West">
      <Item id="ca">California</Item>
      <Item id="or">Oregon</Item>
    </Section>
    <Item id="ny">New York</Item>
  </Picker>
</template>
```

## Key Props

- `items` for data-driven options.
- `selectedKey` / `defaultSelectedKey` for controlled or uncontrolled selection.
- `isOpen` / `defaultOpen` for controlled or uncontrolled menu state.
- `onSelectionChange` and `onOpenChange` callbacks.
- `name` and `form` for hidden native select form integration.

## Accessibility

- Trigger exposes `aria-haspopup="listbox"` and `aria-expanded`.
- Popup uses listbox semantics and option roles from `@vue-spectrum/listbox`.
- Hidden native `<select>` is wired for browser autofill and form submission support.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
