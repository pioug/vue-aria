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

## Controlled And Uncontrolled Selection

Use `selectedKey` when selection is controlled by parent state, and `defaultSelectedKey` for internal picker state.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Picker } from "@vue-spectrum/picker";

const controlledKey = ref("vue");
const items = [
  { key: "vue", label: "Vue" },
  { key: "react", label: "React" },
  { key: "svelte", label: "Svelte" },
];

const handleControlledSelection = (key: string | number | null) => {
  controlledKey.value = key == null ? "" : String(key);
};
</script>

<template>
  <Picker
    aria-label="Controlled picker"
    :items="items"
    :selected-key="controlledKey"
    :on-selection-change="handleControlledSelection"
  />

  <Picker
    aria-label="Uncontrolled picker"
    :items="items"
    default-selected-key="react"
  />
</template>
```

## Controlled And Uncontrolled Open State

Use `isOpen` for fully controlled popup visibility and `defaultOpen` to initialize open state once.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Picker } from "@vue-spectrum/picker";

const isOpen = ref(false);
const items = [
  { key: "one", label: "One" },
  { key: "two", label: "Two" },
];

const handleOpenChange = (next: boolean) => {
  isOpen.value = next;
};
</script>

<template>
  <Picker
    aria-label="Controlled open picker"
    :items="items"
    :is-open="isOpen"
    :on-open-change="handleOpenChange"
  />

  <Picker
    aria-label="Default-open picker"
    :items="items"
    default-open
  />
</template>
```

## Falsy Keys

Picker supports string/number keys including falsy values such as `""` and `0`.

## Accessibility

- Trigger exposes `aria-haspopup="listbox"` and `aria-expanded`.
- Popup uses listbox semantics and option roles from `@vue-spectrum/listbox`.
- Hidden native `<select>` is wired for browser autofill and form submission support.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
