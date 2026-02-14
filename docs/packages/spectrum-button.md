# @vue-spectrum/button

`@vue-spectrum/button` ports upstream `@react-spectrum/button` components for Spectrum visual button patterns.

## Implemented modules

- `ActionButton`
- `Button`
- `ClearButton`
- `FieldButton`
- `LogicButton`
- `ToggleButton`

## Button example

```vue
<script setup lang="ts">
import { Button } from "@vue-spectrum/button";
</script>

<template>
  <Button variant="primary" @press="() => {}">Save</Button>
</template>
```

## ActionButton example

```vue
<script setup lang="ts">
import { ActionButton } from "@vue-spectrum/button";
</script>

<template>
  <ActionButton isQuiet>Edit</ActionButton>
</template>
```

## ToggleButton example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ToggleButton } from "@vue-spectrum/button";

const selected = ref(false);
const onChange = (next: boolean) => {
  selected.value = next;
};
</script>

<template>
  <ToggleButton :isSelected="selected" :onChange="onChange">Pin</ToggleButton>
</template>
```

## Notes

- API and behavior are aligned to upstream component/module names and prop conventions.
- Upstream test intent is mirrored in `packages/@vue-spectrum/button/test`.
- `Spectrum S2` remains out of scope for this port.
