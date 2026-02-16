# @vue-aria/radio

`@vue-aria/radio` ports radio-group accessibility hooks from upstream `@react-aria/radio`.

## Implemented modules

- `useRadio`
- `useRadioGroup`
- `@vue-stately/radio/useRadioGroupState`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useRadio, useRadioGroup } from "@vue-aria/radio";
import { useRadioGroupState } from "@vue-stately/radio";

const state = useRadioGroupState({ defaultValue: "cats" });
const { radioGroupProps, labelProps } = useRadioGroup({ label: "Favorite pet" }, state);

const dogsRef = { current: null as HTMLInputElement | null };
const catsRef = { current: null as HTMLInputElement | null };
const dogs = useRadio({ value: "dogs", children: "Dogs" }, state, dogsRef);
const cats = useRadio({ value: "cats", children: "Cats" }, state, catsRef);
</script>

<template>
  <div v-bind="radioGroupProps">
    <span v-bind="labelProps">Favorite pet</span>
    <label v-bind="dogs.labelProps"><input v-bind="dogs.inputProps" />Dogs</label>
    <label v-bind="cats.labelProps"><input v-bind="cats.inputProps" />Cats</label>
  </div>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Form-validation semantics are an initial parity slice and will be hardened with dedicated form package ports.
