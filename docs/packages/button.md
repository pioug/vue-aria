# @vue-aria/button

`@vue-aria/button` ports button interaction hooks from upstream `@react-aria/button`.

## Implemented modules

- `useButton`
- `useToggleButton`

## Upstream-aligned examples

### useButton

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useButton } from "@vue-aria/button";

const buttonRef = ref<Element | null>(null);
const { buttonProps, isPressed } = useButton(
  {
    elementType: "button",
    onPress: () => console.log("pressed")
  },
  { current: buttonRef.value }
);
</script>

<template>
  <button v-bind="buttonProps">{{ isPressed ? "Pressed" : "Press me" }}</button>
</template>
```

### useToggleButton

```ts
import { useToggleButton } from "@vue-aria/button";

const state = {
  isSelected: false,
  toggle() {
    this.isSelected = !this.isSelected;
  }
};

const { buttonProps } = useToggleButton({ elementType: "button" }, state);
```

## Notes

- `Spectrum S2` is ignored for this port.
- Remaining work focuses on `useToggleButtonGroup` and downstream integration across Spectrum button components.
