# @vue-spectrum/textfield - TextField

`TextField` is a single-line text input with Spectrum field styling, labeling, help text, and validation states.

## Example

```vue
<script setup lang="ts">
import { TextField } from "@vue-spectrum/textfield";
</script>

<template>
  <TextField label="Name" />
</template>
```

## Value

- Uncontrolled: `defaultValue`
- Controlled: `value` + `onChange`

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TextField } from "@vue-spectrum/textfield";

const value = ref("Devon");
const onChange = (next: string) => {
  value.value = next;
};
</script>

<template>
  <TextField label="Name (uncontrolled)" defaultValue="Devon" />
  <TextField label="Name (controlled)" :value="value" :onChange="onChange" />
</template>
```

## Accessibility

- Prefer visible `label`.
- If no visible label is provided, pass `aria-label` or `aria-labelledby`.

## Events

`onChange`, `onFocus`, and `onBlur` are supported and forwarded to input behavior.

## Validation

- `validationState="invalid"` and `isInvalid` mark the field invalid.
- `validationState="valid"` adds a valid state indicator.
- `errorMessage` and `description` render help text.

```vue
<TextField
  label="Favorite number"
  validationState="invalid"
  errorMessage="Single digit numbers are 0-9." />
```

## Visual options

### Quiet

```vue
<TextField label="Name" isQuiet />
```

### Read only

```vue
<TextField label="Name" value="Devon" isReadOnly />
```

### Disabled

```vue
<TextField label="Name" isDisabled />
```

## Related

- [TextArea](/packages/spectrum-textarea)
- `Spectrum S2` remains out of scope unless explicitly requested.
