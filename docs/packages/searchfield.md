# @vue-aria/searchfield

`@vue-aria/searchfield` ports search-field accessibility hooks from upstream `@react-aria/searchfield`.

## Implemented modules

- `useSearchField`
- `@vue-stately/searchfield/useSearchFieldState`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useSearchField } from "@vue-aria/searchfield";
import { useSearchFieldState } from "@vue-stately/searchfield";

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

## Localized labels

```vue
<script setup lang="ts">
import { I18nProvider } from "@vue-aria/i18n";
import { useSearchField } from "@vue-aria/searchfield";
import { useSearchFieldState } from "@vue-stately/searchfield";

const inputRef = { current: null as HTMLInputElement | null };
const state = useSearchFieldState({});
const { inputProps, clearButtonProps } = useSearchField({ "aria-label": "Search" }, state, inputRef);
</script>

<template>
  <I18nProvider locale="fr-FR">
    <input v-bind="inputProps" />
    <button :aria-label="clearButtonProps['aria-label']" @click="clearButtonProps.onPress()" type="button">
      Clear
    </button>
  </I18nProvider>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
