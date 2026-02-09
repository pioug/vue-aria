# @vue-spectrum/view

Vue port of `@react-spectrum/view` container primitives.

## Exports

- `View`
- `Content`
- `Header`
- `Footer`

## Example

```ts
import { h } from "vue";
import { View, Header, Content, Footer } from "@vue-spectrum/view";

const panel = h(View, { elementType: "section" }, () => [
  h(Header, null, () => "Panel title"),
  h(Content, null, () => "Panel body"),
  h(Footer, null, () => "Panel footer"),
]);
```

## Notes

- `View` is a generic container with configurable element type.
- `Content`, `Header`, and `Footer` provide semantic wrappers for common panel composition.
