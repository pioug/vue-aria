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

- `validate` supports custom aria-mode validation.
- `name` + form-level server errors (via `FormValidationContext`) surface invalid help text.
- `validationBehavior="native"` enables browser-native required/constraint semantics.

## Visual options

### Search icon and clear button

- A default search icon is rendered unless `icon=""` is passed.
- The clear button appears when the field has text and is not read-only.

```vue
<SearchField label="Search users" defaultValue="devon" />
```

### Quiet

```vue
<SearchField label="Search" isQuiet />
```

### Invalid and valid states

```vue
<SearchField label="Search" validationState="invalid" errorMessage="Enter a valid query." />
<SearchField label="Search" validationState="valid" />
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
