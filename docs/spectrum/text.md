# @vue-spectrum/text

Vue port of `@react-spectrum/text` primitives.

## Exports

- `Text`
- `Heading`
- `Keyboard`

## Example

```ts
import { h } from "vue";
import { Heading, Text, Keyboard } from "@vue-spectrum/text";

const heading = h(Heading, { level: 2 }, () => "Shortcuts");
const body = h(Text, null, () => "Use ");
const shortcut = h(Keyboard, null, () => "Cmd+K");
```

## Notes

- `Text` renders a semantic-neutral `span` with `role="none"` by default.
- `Heading` renders `h3` by default and supports `level` overrides from 1 to 6.
- `Keyboard` renders keyboard command text using `kbd` semantics.
