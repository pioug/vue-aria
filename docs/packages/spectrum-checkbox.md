# @vue-spectrum/checkbox

`@vue-spectrum/checkbox` ports upstream Spectrum checkbox components.

## Implemented modules

- `Checkbox`
- `CheckboxGroup`

## Checkbox example

```vue
<script setup lang="ts">
import { Checkbox } from "@vue-spectrum/checkbox";
</script>

<template>
  <Checkbox>Click Me</Checkbox>
</template>
```

## CheckboxGroup example

```vue
<script setup lang="ts">
import { Checkbox } from "@vue-spectrum/checkbox";
import { CheckboxGroup } from "@vue-spectrum/checkbox";
</script>

<template>
  <CheckboxGroup label="Favorite Pet">
    <Checkbox value="dogs">Dogs</Checkbox>
    <Checkbox value="cats">Cats</Checkbox>
    <Checkbox value="dragons">Dragons</Checkbox>
  </CheckboxGroup>
</template>
```

## Notes

- Group selection values are managed through `value` / `defaultValue` and `onChange`.
- `isIndeterminate`, `isReadOnly`, `isDisabled`, and validation props mirror upstream naming.
- `Spectrum S2` remains out of scope unless explicitly requested.
