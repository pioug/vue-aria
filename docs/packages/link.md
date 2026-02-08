# @vue-aria/link

Semantic link behavior for native and non-native elements.

## `useLink`

Provides accessible link props and normalized press/focus behavior.

```ts
import { useLink } from "@vue-aria/link";

const { linkProps, isPressed } = useLink({
  href: "/docs",
});
```

## Default (`<a>`)

- Keeps native link semantics.
- Applies `tabindex=0`.
- Applies `href`, `target`, `rel`, `download` when provided.

## Non-native element (`div`, `span`)

- Adds `role="link"`.
- Adds keyboard focusability with `tabindex=0` unless disabled.

## Disabled links

- Applies `aria-disabled=true`.
- Removes focusability for non-native link elements.
- Prevents default click navigation behavior.
