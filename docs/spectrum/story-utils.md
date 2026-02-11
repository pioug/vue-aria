# @vue-spectrum/story-utils

Vue baseline port of `@react-spectrum/story-utils`.

## Purpose

Storybook/infrastructure helpers used by Spectrum component stories.

## Exports

- `ErrorBoundary`
- `generatePowerset(states, exclude?)`

## Example

```ts
import { generatePowerset } from "@vue-spectrum/story-utils";

const combinations = generatePowerset([
  { isQuiet: true },
  { size: ["S", "L"] },
]);
```

## Notes

- `ErrorBoundary` is ported as a Vue component that captures slot errors and renders a fallback message.
- `generatePowerset` keeps the upstream merge/exclude strategy using `@vue-aria/utils` `mergeProps`.
