# @vue-spectrum/combobox - ComboBox

`ComboBox` combines a text input with a listbox of suggestions.

## Example

```vue
<script setup lang="ts">
import { ComboBox } from "@vue-spectrum/combobox";

const items = [
  { key: "vue", label: "Vue" },
  { key: "svelte", label: "Svelte" },
  { key: "react", label: "React" },
];
</script>

<template>
  <ComboBox label="Framework" :items="items" />
</template>
```

## Slot Collection

```vue
<script setup lang="ts">
import { ComboBox, Item, Section } from "@vue-spectrum/combobox";
</script>

<template>
  <ComboBox label="State">
    <Section title="West">
      <Item id="ca">California</Item>
      <Item id="or">Oregon</Item>
    </Section>
    <Item id="ny">New York</Item>
  </ComboBox>
</template>
```

## Key Props

- `items` for data-driven suggestions.
- `selectedKey` / `defaultSelectedKey` for selection state.
- `inputValue` / `defaultInputValue` for text input control.
- `isOpen` / `defaultOpen` for popup state control.
- `onSelectionChange`, `onInputChange`, and `onOpenChange` callbacks.

## Accessibility

- Input exposes combobox semantics (`role="combobox"`).
- Popup options use listbox semantics via `@vue-spectrum/listbox`.
- Keyboard interaction and focus management are delegated to `@vue-aria/combobox`.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
