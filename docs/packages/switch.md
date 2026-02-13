# @vue-aria/switch

`@vue-aria/switch` ports switch accessibility behavior from upstream `@react-aria/switch`.

## Implemented modules

- `useSwitch`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useSwitch } from "@vue-aria/switch";
import { useToggleState } from "@vue-aria/toggle-state";

const inputRef = { current: null as HTMLInputElement | null };
const state = useToggleState();

const { labelProps, inputProps } = useSwitch(
  { "aria-label": "Enable notifications" },
  state,
  inputRef
);
</script>

<template>
  <label v-bind="labelProps">
    <input v-bind="inputProps" />
    Enable notifications
  </label>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- This package currently depends on `@vue-aria/toggle` for core interaction behavior parity.
