# @vue-spectrum/textfield - TextArea

`TextArea` is a multiline text input with Spectrum field styling, labeling, help text, and validation states.

## Example

```vue
<script setup lang="ts">
import { TextArea } from "@vue-spectrum/textfield";
</script>

<template>
  <TextArea label="Message" />
</template>
```

## Value

- Uncontrolled: `defaultValue`
- Controlled: `value` + `onChange`

## Accessibility

- Prefer visible `label`.
- If no visible label is provided, pass `aria-label` or `aria-labelledby`.

## Autosizing behavior

`TextArea` auto-resizes by content for quiet fields and for default fields when no explicit `height` is provided.

```vue
<TextArea label="Notes" isQuiet />
```

```vue
<TextArea label="Notes" height="size-2000" />
```

## Validation

Use `validationState`, `isInvalid`, `description`, and `errorMessage` similarly to `TextField`.

## Visual options

### Standard vs quiet

```vue
<TextArea label="Message (standard)" />
<TextArea label="Message (quiet)" isQuiet />
```

### Quiet

```vue
<TextArea label="Message" isQuiet />
```

### Read only

```vue
<TextArea label="Message" value="Read only text" isReadOnly />
```

### Disabled

```vue
<TextArea label="Message" isDisabled />
```

## Related

- [TextField](/packages/spectrum-textfield)
- `Spectrum S2` remains out of scope unless explicitly requested.
