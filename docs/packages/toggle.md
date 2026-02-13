# @vue-aria/toggle

`@vue-aria/toggle` ports toggle interaction/accessibility behavior from upstream `@react-aria/toggle`.

## Implemented modules

- `useToggle`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useToggle } from "@vue-aria/toggle";

const inputRef = { current: null as HTMLInputElement | null };
const state = {
  isSelected: false,
  defaultSelected: false,
  setSelected(value: boolean) {
    this.isSelected = value;
  },
  toggle() {
    this.isSelected = !this.isSelected;
  }
};

const { labelProps, inputProps } = useToggle({ "aria-label": "Enable option" }, state, inputRef);
</script>

<template>
  <label v-bind="labelProps">
    <input v-bind="inputProps" />
    Enable option
  </label>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Remaining work focuses on downstream checkbox/switch integration coverage.
