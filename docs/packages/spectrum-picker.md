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
- `isLoading` for trigger and menu loading indicators.
- `onSelectionChange` and `onOpenChange` callbacks.
- `name`, `form`, and `autoComplete` for hidden native select form/autofill integration.

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

## Async Loading

Picker renders loading indicators for both initial and incremental loading states.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Picker } from "@vue-spectrum/picker";

const items = ref<{ key: string; label: string }[]>([]);
const isLoading = ref(true);

setTimeout(() => {
  items.value = [
    { key: "one", label: "One" },
    { key: "two", label: "Two" },
  ];
  isLoading.value = false;
}, 500);
</script>

<template>
  <Picker
    aria-label="Async picker"
    :items="items"
    :is-loading="isLoading"
  />
</template>
```

- no items + `isLoading`: trigger-level spinner (`Loading…`)
- with items + `isLoading`: loading-more spinner row inside the popup listbox (`Loading more…`)

## Link Items And Routing

Picker options can render as links using slot items.

```vue
<script setup lang="ts">
import { Item, Picker } from "@vue-spectrum/picker";
</script>

<template>
  <Picker aria-label="Navigation">
    <Item id="home" href="/home" :router-options="{ from: 'picker' }">Home</Item>
    <Item id="docs" href="https://adobe.com">Docs</Item>
  </Picker>
</template>
```

When used inside `@vue-spectrum/provider`, internal links can be resolved and navigated through the provided router.

## Form Integration

Picker includes a hidden native `<select>` so standard form submission and browser autofill continue to work.

```vue
<template>
  <form id="profile">
    <Picker
      aria-label="State"
      name="state"
      form="profile"
      auto-complete="address-level1"
      :items="[
        { key: 'ca', label: 'California' },
        { key: 'ny', label: 'New York' }
      ]"
      default-selected-key="ca"
    />
  </form>
</template>
```

## Accessibility

- Trigger exposes `aria-haspopup="listbox"` and `aria-expanded`.
- Popup uses listbox semantics and option roles from `@vue-spectrum/listbox`.
- Hidden native `<select>` is wired for browser autofill and form submission support.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
