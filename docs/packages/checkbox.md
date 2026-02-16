# @vue-aria/checkbox

`@vue-aria/checkbox` ports checkbox accessibility hooks from upstream `@react-aria/checkbox`.

## Implemented modules

- `useCheckbox`
- `useCheckboxGroup`
- `useCheckboxGroupItem`
- `@vue-stately/checkbox/useCheckboxGroupState`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useCheckbox } from "@vue-aria/checkbox";
import { useToggleState } from "@vue-stately/toggle";

const inputRef = { current: null as HTMLInputElement | null };
const state = useToggleState();

const { inputProps, labelProps } = useCheckbox(
  { "aria-label": "Subscribe to updates" },
  state,
  inputRef
);
</script>

<template>
  <label v-bind="labelProps">
    <input v-bind="inputProps" />
    Subscribe to updates
  </label>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Group-level form validation behavior is implemented as an initial parity slice and will be deepened with form package ports.
