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
- `name` / `form` for form participation when used inside or alongside native forms.

## Controlled Selection

When `selectedKey` is provided, selection is controlled by parent state. User selection emits `onSelectionChange`, and the rendered value follows the controlled prop.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ComboBox } from "@vue-spectrum/combobox";

const selectedKey = ref("vue");
const items = [
  { key: "vue", label: "Vue" },
  { key: "react", label: "React" },
  { key: "svelte", label: "Svelte" },
];

const onSelectionChange = (key: string | number | null) => {
  selectedKey.value = key == null ? "" : String(key);
};
</script>

<template>
  <ComboBox
    label="Framework"
    :items="items"
    :selected-key="selectedKey"
    :on-selection-change="onSelectionChange"
  />
</template>
```

## Open State Control

Use `isOpen` for controlled popup visibility or `defaultOpen` for initial uncontrolled visibility.

## Form Integration

Set `name` and optional `form` to attach the combobox input to form submission, including cases where the input is outside the target `<form>` element.

## Accessibility

- Input exposes combobox semantics (`role="combobox"`).
- Popup options use listbox semantics via `@vue-spectrum/listbox`.
- Keyboard interaction and focus management are delegated to `@vue-aria/combobox`.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
