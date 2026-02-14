# @vue-spectrum/button - LogicButton

`LogicButton` renders boolean logic operators inside query/filter builders.

## Example

```vue
<script setup lang="ts">
import { LogicButton } from "@vue-spectrum/button";
</script>

<template>
  <LogicButton variant="and">And</LogicButton>
</template>
```

## Content

LogicButtons require a `variant` (`and` or `or`) and can include visible label content.

```vue
<LogicButton variant="or">Or</LogicButton>
```

## Internationalization

Use localized `children` text or localized `aria-label`.

## Events

Use `onPress` for mouse/keyboard/touch activation.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { LogicButton } from "@vue-spectrum/button";

const variant = ref<"and" | "or">("or");
const toggleVariant = () => {
  variant.value = variant.value === "or" ? "and" : "or";
};
</script>

<template>
  <LogicButton :variant="variant" :onPress="toggleVariant">{{ variant }}</LogicButton>
</template>
```

## Visual Options

### Variant

```vue
<LogicButton variant="or" marginEnd="20px">Or</LogicButton>
<LogicButton variant="and">And</LogicButton>
```

### Disabled

```vue
<LogicButton variant="or" isDisabled>Or</LogicButton>
```
