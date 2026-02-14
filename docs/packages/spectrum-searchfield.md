# @vue-spectrum/searchfield - SearchField

`SearchField` is a text field specialized for search interactions, with submit and clear behavior.

## Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { SearchField } from "@vue-spectrum/searchfield";

const submittedText = ref<string | null>(null);
const onSubmit = (value: string) => {
  submittedText.value = value;
};
</script>

<template>
  <SearchField label="Search" :onSubmit="onSubmit" />
  <p>Submitted text: {{ submittedText }}</p>
</template>
```

## Value

- Uncontrolled: `defaultValue`
- Controlled: `value` + `onChange`

## Events

- `onChange`: fired when user edits value
- `onSubmit`: fired when Enter submits
- `onClear`: fired when search value is cleared (Escape or clear button)

## Accessibility

- Prefer visible `label`.
- If no visible label is used, provide `aria-label` or `aria-labelledby`.

## HTML forms

`SearchField` supports `name` and native input attributes (`type`, `pattern`, `inputMode`, etc.) for form integration.

## Validation

Use `validationState`, `isInvalid`, `description`, and `errorMessage` for validation feedback.

## Visual options

### Quiet

```vue
<SearchField label="Search" isQuiet />
```

### Disabled

```vue
<SearchField label="Search" isDisabled />
```

### Read only

```vue
<SearchField label="Search" defaultValue="abc@adobe.com" isReadOnly />
```

### Custom icon

```vue
<SearchField label="Search users" icon="👤" />
```

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
