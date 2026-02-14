# @vue-spectrum/button - ActionButton

`ActionButton` is used for lower-emphasis task actions in dense workflows.

## Example

```vue
<script setup lang="ts">
import { ActionButton } from "@vue-spectrum/button";
</script>

<template>
  <ActionButton>Edit</ActionButton>
</template>
```

## Content

ActionButtons can contain label text, an icon, or both.

```vue
<ActionButton>
  <span class="spectrum-Icon" aria-hidden="true">✎</span>
  <span class="spectrum-ActionButton-label">Edit</span>
</ActionButton>
```

## Accessibility

Icon-only usage requires `aria-label`.

```vue
<ActionButton aria-label="Edit">
  <span class="spectrum-Icon" aria-hidden="true">✎</span>
</ActionButton>
```

## Internationalization

Pass localized `children` text or localized `aria-label`.

## Events

Use `onPress` for mouse/keyboard/touch activation.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ActionButton } from "@vue-spectrum/button";

const count = ref(0);
</script>

<template>
  <ActionButton :onPress="() => (count.value += 1)">{{ count }} Edits</ActionButton>
</template>
```

## Visual Options

### Quiet

```vue
<ActionButton isQuiet>Action!</ActionButton>
```

### Disabled

```vue
<ActionButton isDisabled>Action!</ActionButton>
```

### Static color

```vue
<ActionButton staticColor="white">
  <span class="spectrum-Icon" aria-hidden="true">✎</span>
  <span class="spectrum-ActionButton-label">Edit</span>
</ActionButton>

<ActionButton staticColor="black" isQuiet>
  <span class="spectrum-Icon" aria-hidden="true">✎</span>
  <span class="spectrum-ActionButton-label">Edit</span>
</ActionButton>
```
