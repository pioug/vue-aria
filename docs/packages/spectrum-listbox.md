# @vue-spectrum/listbox - ListBox

`ListBox` renders selectable option lists with Spectrum menu/listbox semantics.

## Basic Usage

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

## Selection Modes

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

## Data-Driven Items

```vue
<script setup lang="ts">
import { ListBox } from "@vue-spectrum/listbox";

const items = [
  { key: "todo", name: "To do" },
  { key: "doing", name: "In progress" },
  { key: "done", name: "Done" },
];
</script>

<template>
  <ListBox
    aria-label="Workflow status"
    :items="items"
    selection-mode="single"
    :default-selected-keys="['doing']"
  />
</template>
```

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

## Async Loading

`ListBox` supports progressive loading with `isLoading`, `maxHeight`, and `onLoadMore`.

```vue
<script setup lang="ts">
import { ListBox } from "@vue-spectrum/listbox";
import { ref } from "vue";

const items = ref(
  Array.from({ length: 20 }, (_, index) => ({
    key: `item-${index + 1}`,
    name: `Item ${index + 1}`,
  }))
);
const isLoading = ref(false);

async function onLoadMore() {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 300));
  const start = items.value.length + 1;
  items.value = [
    ...items.value,
    ...Array.from({ length: 20 }, (_, offset) => ({
      key: `item-${start + offset}`,
      name: `Item ${start + offset}`,
    })),
  ];
  isLoading.value = false;
}
</script>

<template>
  <ListBox
    aria-label="Infinite list"
    :items="items"
    :is-loading="isLoading"
    :max-height="320"
    :on-load-more="onLoadMore"
  />
</template>
```

When loading:
- empty list renders a `Loading…` option with a progressbar
- populated list renders a trailing `Loading more…` option

Optional loading control:
- `showLoadingSpinner` defaults to `true`.
- set `:show-loading-spinner="false"` to suppress the spinner row while `isLoading` is true (useful when a parent component renders loading UI elsewhere).

## Link Items

`Item` can render links with `href`. Internal navigation can be routed through `Provider` router config.

```vue
<script setup lang="ts">
import { Item, ListBox } from "@vue-spectrum/listbox";
</script>

<template>
  <ListBox aria-label="Links">
    <Item key="home" href="/home" :router-options="{ from: 'listbox' }">Home</Item>
    <Item key="docs" href="https://adobe.com">External docs</Item>
  </ListBox>
</template>
```

## Key Handling

`ListBox` supports section/item keys that are numeric or empty-string values in addition to typical string keys.

## Accessibility

- Root uses `role="listbox"`.
- Options use `role="option"` and `aria-selected` for selectable modes.
- Section groups use `role="group"` with heading labeling.
- Provide either `aria-label` or `aria-labelledby` for the listbox.
- Complex options can include label and description content for `aria-labelledby` / `aria-describedby` wiring.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
