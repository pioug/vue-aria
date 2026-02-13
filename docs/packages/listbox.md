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

const listRef = { current: null as HTMLElement | null };
const optionRef = { current: null as HTMLElement | null };

// Placeholder state shape; in real usage this comes from list state management.
const state = {
  collection: {
    getItem: () => null,
    getFirstKey: () => null,
    getLastKey: () => null,
    getKeyBefore: () => null,
    getKeyAfter: () => null
  },
  disabledKeys: new Set(),
  selectionManager: {
    selectionMode: "single",
    selectionBehavior: "toggle",
    isFocused: false,
    focusedKey: null
  }
} as any;

const { listBoxProps } = useListBox({ "aria-label": "Example list" }, state, listRef);
const { optionProps } = useOption({ key: "a" }, state, optionRef);
</script>

<template>
  <ul :ref="(el) => (listRef.current = el as HTMLElement | null)" v-bind="listBoxProps">
    <li :ref="(el) => (optionRef.current = el as HTMLElement | null)" v-bind="optionProps">
      Option A
    </li>
  </ul>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
