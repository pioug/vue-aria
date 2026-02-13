# @vue-aria/searchfield

`@vue-aria/searchfield` ports search-field accessibility hooks from upstream `@react-aria/searchfield`.

## Implemented modules

- `useSearchField`
- `@vue-aria/searchfield-state/useSearchFieldState`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useSearchField } from "@vue-aria/searchfield";
import { useSearchFieldState } from "@vue-aria/searchfield-state";

const inputRef = { current: null as HTMLInputElement | null };
const state = useSearchFieldState({});
const { inputProps, clearButtonProps, labelProps } = useSearchField(
  { "aria-label": "Search docs" },
  state,
  inputRef
);
</script>

<template>
  <label v-bind="labelProps">Search</label>
  <input v-bind="inputProps" />
  <button @click="clearButtonProps.onPress()" type="button">Clear</button>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Localized clear-button label currently ships with baseline dictionary coverage in this slice.
