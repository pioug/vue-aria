# @vue-spectrum/style-macro-s1

Vue baseline port of `@react-spectrum/style-macro-s1`.

## Purpose

This package provides the Spectrum v1 style-macro runtime and theme helpers used by internal/infrastructure package work.

## Exports

- `style`
- `baseColor`
- `lightDark`
- `focusRing`
- `raw`
- `keyframes`

## Example

```ts
import { style } from "@vue-spectrum/style-macro-s1";

const card = style({
  backgroundColor: "gray-100",
  padding: 4,
  borderRadius: "lg",
});

const className = String(card);
```

## Notes

- This baseline keeps the upstream package file layout (`index.ts`, `src/runtime.ts`, `src/style-macro.ts`, `src/spectrum-theme.ts`, `src/types.ts`) to stay close to the original repo structure.
- Runtime merge behavior and helper surfaces are covered by local unit tests.
- Full package parity remains in progress and tracked in the Spectrum roadmap/tracker.
