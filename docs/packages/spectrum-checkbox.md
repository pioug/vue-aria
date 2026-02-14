# @vue-spectrum/checkbox - Checkbox

`Checkbox` allows selecting a single boolean option.

## Example

```vue
<script setup lang="ts">
import { Checkbox } from "@vue-spectrum/checkbox";
</script>

<template>
  <Checkbox>Unsubscribe</Checkbox>
</template>
```

## Content

Checkbox labels are rendered from `children` (slot content).

## Accessibility

- If there is no visible label, provide `aria-label` or `aria-labelledby`.
- Checkbox supports RTL layouts through shared i18n direction handling.

## Internationalization

Pass localized label text in slot content (or localized `aria-label` for non-visible labels).

## Value

- Uncontrolled: `defaultSelected`
- Controlled: `isSelected` + `onChange`

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "@vue-spectrum/checkbox";

const selected = ref(true);
const onControlledChange = (next: boolean) => {
  selected.value = next;
};
</script>

<template>
  <Checkbox defaultSelected>Subscribe (uncontrolled)</Checkbox>
  <Checkbox :isSelected="selected" :onChange="onControlledChange">
    Subscribe (controlled)
  </Checkbox>
</template>
```

### Indeterminate

`isIndeterminate` controls mixed visual state and remains until explicitly cleared.

```vue
<Checkbox isIndeterminate>Subscribe</Checkbox>
```

### HTML forms

Use `name` and `value` to integrate with native form submissions.

```vue
<Checkbox name="newsletter" value="subscribe">Subscribe</Checkbox>
```

## Events

`onChange` fires when users toggle selection.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "@vue-spectrum/checkbox";

const selected = ref(false);
const onChange = (next: boolean) => {
  selected.value = next;
};
</script>

<template>
  <Checkbox :isSelected="selected" :onChange="onChange">Subscribe</Checkbox>
  <div>You are {{ selected ? "subscribed" : "unsubscribed" }}</div>
</template>
```

## Validation

Set `isInvalid` to reflect application validation state.

```vue
<Checkbox isInvalid>I accept the terms and conditions</Checkbox>
```

## Visual options

### Disabled

```vue
<Checkbox isDisabled>Subscribe</Checkbox>
```

### Emphasized

```vue
<Checkbox isEmphasized defaultSelected>Subscribe</Checkbox>
```

## Related

- [CheckboxGroup](/packages/spectrum-checkbox-group)
- `Spectrum S2` remains out of scope unless explicitly requested.
