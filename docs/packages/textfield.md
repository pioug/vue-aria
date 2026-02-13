# @vue-aria/textfield

`@vue-aria/textfield` ports textfield accessibility hooks from upstream `@react-aria/textfield`.

## Implemented modules

- `useTextField`
- `useFormattedTextField`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useTextField } from "@vue-aria/textfield";

const inputRef = { current: null as HTMLInputElement | null };
const { inputProps, labelProps, descriptionProps, errorMessageProps } = useTextField(
  {
    label: "Name",
    description: "Enter your full name",
    "aria-label": "Name"
  },
  inputRef
);
</script>

<template>
  <label v-bind="labelProps">Name</label>
  <input v-bind="inputProps" />
  <p v-bind="descriptionProps">Enter your full name</p>
  <p v-bind="errorMessageProps"></p>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Form validation semantics are currently a simplified parity slice pending dedicated form package ports.
