# @vue-aria/interactions

Low-level interaction responders for pointer, keyboard, and virtual input.

## `useKeyboard`

Normalizes keyboard handlers with stop-propagation by default and `continuePropagation()` opt-in.

```ts
import { useKeyboard } from "@vue-aria/interactions";

const { keyboardProps } = useKeyboard({
  onKeydown: (event) => {
    if (event.key === "Escape") {
      event.continuePropagation?.();
    }
  },
});
```

## `useFocus`

Handles focus events for an immediate target only.

```ts
import { useFocus } from "@vue-aria/interactions";

const { focusProps } = useFocus({
  onFocusChange: (isFocused) => {
    console.log(isFocused);
  },
});
```

## `useFocusWithin`

Tracks focus entering/leaving a subtree.

```ts
import { useFocusWithin } from "@vue-aria/interactions";

const { focusWithinProps } = useFocusWithin({
  onFocusWithinChange: (isFocusedWithin) => {
    console.log(isFocusedWithin);
  },
});
```

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

## `useHover`

Tracks hover state for pointer-capable devices.

```ts
import { useHover } from "@vue-aria/interactions";

const { hoverProps, isHovered } = useHover({
  onHoverChange: (hovered) => {
    console.log(hovered);
  },
});
```

### Behavior Notes

- Ignores touch pointer hover.
- Ignores emulated mouse hover immediately after touch interactions.
- Ends hover when the tracked element stops containing the current pointer target.
