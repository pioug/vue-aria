# @vue-aria/label

`@vue-aria/label` ports form labeling helpers from upstream `@react-aria/label`.

## Implemented modules

- `useLabel`
- `useField`

## Upstream-aligned examples

### useLabel

```vue
<script setup lang="ts">
import { useLabel } from "@vue-aria/label";

const { labelProps, fieldProps } = useLabel({ label: "Name" });
</script>

<template>
  <label v-bind="labelProps">Name</label>
  <input v-bind="fieldProps" />
</template>
```

### useField

```vue
<script setup lang="ts">
import { useField } from "@vue-aria/label";

const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
  label: "Email",
  description: "We will only use this for account notifications.",
  errorMessage: "Email is required",
  isInvalid: true
});
</script>

<template>
  <label v-bind="labelProps">Email</label>
  <input v-bind="fieldProps" />
  <p v-bind="descriptionProps">We will only use this for account notifications.</p>
  <p v-bind="errorMessageProps">Email is required</p>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Remaining work focuses on deeper downstream integration with field components.
