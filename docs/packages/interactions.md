# @vue-aria/interactions

`@vue-aria/interactions` ports the interaction hooks and helpers from upstream `@react-aria/interactions` into Vue composables/components.

## Implemented modules

- `focusSafely`
- `useFocusVisible` infrastructure (`isFocusVisible`, `getInteractionModality`, `setInteractionModality`, `getPointerType`, `addWindowFocusTracking`, `useInteractionModality`, `useFocusVisible`, `useFocusVisibleListener`)
- `useKeyboard`
- `useFocus`
- `useFocusWithin`
- `useInteractOutside`
- `useHover`
- `useScrollWheel`
- `useMove`
- `usePress`
- `useLongPress`
- `PressResponder`, `ClearPressResponder`, `PressResponderContext`
- `useFocusable`, `FocusableProvider`, `Focusable`, `FocusableContext`
- `Pressable`

## Upstream-aligned examples

### usePress

```vue
<script setup lang="ts">
import { usePress } from "@vue-aria/interactions";

const { pressProps } = usePress({
  onPress: (e) => {
    console.log("press", e.pointerType);
  },
  onPressStart: (e) => {
    console.log("pressstart", e.pointerType);
  },
  onPressEnd: (e) => {
    console.log("pressend", e.pointerType);
  }
});
</script>

<template>
  <button v-bind="pressProps">Press me</button>
</template>
```

### useLongPress

```vue
<script setup lang="ts">
import { useLongPress } from "@vue-aria/interactions";

const { longPressProps } = useLongPress({
  threshold: 500,
  accessibilityDescription: "Long press to open menu",
  onLongPress: () => {
    console.log("longpress");
  }
});
</script>

<template>
  <button v-bind="longPressProps">Long press me</button>
</template>
```

### Pressable

```vue
<script setup lang="ts">
import { Pressable } from "@vue-aria/interactions";
</script>

<template>
  <Pressable :onPress="() => console.log('pressed')">
    <button>Action</button>
  </Pressable>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Remaining work focuses on deep parity for responder/focusable edge cases and broader upstream test migration coverage.
