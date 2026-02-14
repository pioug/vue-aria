# @vue-spectrum/button - ToggleButton

`ToggleButton` represents a two-state pressed/unpressed action button.

## Example

```vue
<script setup lang="ts">
import { ToggleButton } from "@vue-spectrum/button";
</script>

<template>
  <ToggleButton>Pin</ToggleButton>
</template>
```

## Content

ToggleButtons can include a label, an icon, or both.

```vue
<ToggleButton>
  <span class="spectrum-Icon" aria-hidden="true">📌</span>
  <span class="spectrum-ActionButton-label">Pin</span>
</ToggleButton>
```

## Accessibility

If no visible label exists, provide `aria-label`.

```vue
<ToggleButton aria-label="Pin">
  <span class="spectrum-Icon" aria-hidden="true">📌</span>
</ToggleButton>
```

`ToggleButton` is intended for a stable action label. If the label itself changes by state (e.g. play/pause), use `ActionButton` instead.

## Internationalization

Use localized `children` text or localized `aria-label`.

## Value

- Uncontrolled: `defaultSelected`
- Controlled: `isSelected` + `onChange`

## Events

`onChange` fires when selection toggles.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ToggleButton } from "@vue-spectrum/button";

const isSelected = ref(false);
const onChange = (next: boolean) => {
  isSelected.value = next;
};
</script>

<template>
  <ToggleButton isEmphasized :isSelected="isSelected" :onChange="onChange" aria-label="Pin">
    <span class="spectrum-Icon" aria-hidden="true">📌</span>
  </ToggleButton>
</template>
```

## Visual Options

### Quiet

```vue
<ToggleButton isQuiet>Pin</ToggleButton>
```

### Disabled

```vue
<ToggleButton isDisabled>Pin</ToggleButton>
```

### Emphasized

```vue
<ToggleButton isEmphasized defaultSelected>Pin</ToggleButton>
```

### Static color

```vue
<ToggleButton staticColor="white">
  <span class="spectrum-Icon" aria-hidden="true">📌</span>
  <span class="spectrum-ActionButton-label">Pin</span>
</ToggleButton>

<ToggleButton staticColor="black" isQuiet defaultSelected>
  <span class="spectrum-Icon" aria-hidden="true">📌</span>
  <span class="spectrum-ActionButton-label">Pin</span>
</ToggleButton>
```
