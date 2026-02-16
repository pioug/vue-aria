# @vue-aria/listbox

`@vue-aria/listbox` ports listbox accessibility hooks from upstream `@react-aria/listbox`.

## Implemented modules

- `useListBox`
- `useOption`
- `useListBoxSection`
- `getItemId`
- `listData`

## Upstream-aligned example

```vue
<script setup lang="ts">
import { useListBox, useOption } from "@vue-aria/listbox";
import { useListState } from "@vue-stately/list";

const listRef = { current: null as HTMLElement | null };
const optionARef = { current: null as HTMLElement | null };
const optionBRef = { current: null as HTMLElement | null };

const state = useListState({
  selectionMode: "single",
  items: [
    { id: "a", label: "Option A" },
    { id: "b", label: "Option B" }
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label
});

const { listBoxProps } = useListBox({ "aria-label": "Example list" }, state, listRef);
const { optionProps: optionAProps } = useOption({ key: "a" }, state, optionARef);
const { optionProps: optionBProps } = useOption({ key: "b" }, state, optionBRef);
</script>

<template>
  <ul :ref="(el) => (listRef.current = el as HTMLElement | null)" v-bind="listBoxProps">
    <li :ref="(el) => (optionARef.current = el as HTMLElement | null)" v-bind="optionAProps">
      Option A
    </li>
    <li :ref="(el) => (optionBRef.current = el as HTMLElement | null)" v-bind="optionBProps">
      Option B
    </li>
  </ul>
</template>
```

## Notes

- Pair `useListBox` with `useListState` from `@vue-stately/list` for upstream-equivalent behavior.
- `Spectrum S2` is ignored for this port.
