# @vue-aria/button

Semantic button behavior for native and non-native elements.

## `useButton`

Composes `usePress` and `useFocusRing` while applying correct button semantics.

```ts
import { useButton } from "@vue-aria/button";

const { buttonProps, isPressed, isFocused, isFocusVisible } = useButton({
  elementType: "button",
  onPress: () => {},
});
```

## `useToggleButton`

Builds on `useButton` with pressed-state semantics (`aria-pressed`) for toggle actions.

```ts
import { useToggleButton } from "@vue-aria/button";
import { useToggleState } from "@vue-aria/toggle-state";

const state = useToggleState({ defaultSelected: false });
const { buttonProps, isPressed } = useToggleButton(
  { "aria-label": "Bold" },
  state
);
```

## Native Button Behavior

For `elementType: "button"`:

- Sets `type` (default `"button"`)
- Sets `disabled`
- Uses browser keyboard behavior

## Non-native Button Behavior

For `div`, `span`, `a`:

- Adds `role="button"`
- Adds `tabindex`
- Applies `aria-disabled` when needed
- Uses press responder for keyboard interaction

## Link Behavior

For `elementType: "a"`:

- Preserves `href`, `target`, `rel` when enabled
- Removes `href` when disabled
