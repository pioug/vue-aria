# @vue-spectrum/layout

Vue port of `@react-spectrum/layout` primitives.

## Exports

- `Flex`
- `Grid`
- `repeat`
- `minmax`
- `fitContent`

## Example

```ts
import { h } from "vue";
import { Flex, Grid, repeat } from "@vue-spectrum/layout";

const stack = h(Flex, { direction: "column", gap: 8 }, () => []);

const board = h(Grid, {
  columns: repeat("auto-fit", "200px"),
  rowGap: 12,
  columnGap: 12,
});
```

## Notes

- `Flex` normalizes `start`/`end` alignment to browser-compatible flex values.
- `Grid` includes helper utilities for CSS grid template generation.
- Numeric gap and dimension values are converted to pixel strings.
