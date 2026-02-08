# @vue-aria/interactions

Low-level interaction responders for pointer, keyboard, and virtual input.

## `usePress`

Unifies press behavior across mouse, touch, keyboard, and assistive virtual clicks.

```ts
import { usePress } from "@vue-aria/interactions";

const { pressProps, isPressed } = usePress({
  onPress: (event) => {
    console.log(event.pointerType);
  },
});
```

### Return Value

- `pressProps`: pointer/keyboard/click handlers
- `isPressed`: reactive pressed state

### Supported Events

- `onPressStart`
- `onPressEnd`
- `onPress`

### Behavior Notes

- Enter triggers immediate keyboard press.
- Space starts press on keydown and triggers on keyup.
- Virtual clicks (`event.detail === 0`) map to `pointerType: "virtual"`.
