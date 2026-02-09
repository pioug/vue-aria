# @vue-spectrum/utils

Shared utility baseline for the Spectrum component migration.

## Exports

- `classNames`
- `keepSpectrumClassNames`
- `shouldKeepSpectrumClassNames`
- `useSlotProps`
- `cssModuleToSlots`
- `SlotProvider`
- `ClearSlots`
- `getWrappedElement`
- `useMediaQuery`
- `useIsMobileDevice`
- `MOBILE_SCREEN_WIDTH`
- `useHasChild`
- `createDOMRef`
- `createFocusableRef`
- `useDOMRef`
- `useFocusableRef`
- `unwrapDOMRef`
- `useUnwrapDOMRef`
- `BreakpointProvider`
- `useMatchedBreakpoints`
- `useBreakpoint`
- `baseStyleProps`
- `viewStyleProps`
- `dimensionValue`
- `responsiveDimensionValue`
- `convertStyleProps`
- `useStyleProps`
- `passthroughStyle`
- `getResponsiveProp`

## `classNames`

`classNames` supports both:

- generic `clsx`-style joining
- React Spectrum-style CSS module mapping (`classNames(cssModule, ...)`)

```ts
import { classNames } from "@vue-spectrum/utils";

const classes = classNames("base", { selected: true });
```

```ts
const styles = { root: "mapped-root" };
const classes = classNames(styles, "root", { external: true });
// => "mapped-root external"
```

## `keepSpectrumClassNames`

Enable temporary legacy class-name compatibility mode when CSS overrides still target raw Spectrum selectors.

```ts
import { keepSpectrumClassNames } from "@vue-spectrum/utils";

keepSpectrumClassNames();
```

## Slots Utilities

`useSlotProps` and `SlotProvider` bring the React Spectrum slot-prop merge pattern to Vue package ports.

```ts
import { SlotProvider, useSlotProps } from "@vue-spectrum/utils";
```

## `getWrappedElement`

Normalizes text or vnode children into a single element vnode (wrapping strings in `span`), matching React Spectrum utility behavior used by link-like components.

## Media + Device Utilities

Utilities for responsive and device-aware behavior:

```ts
import {
  useMediaQuery,
  useIsMobileDevice,
  useHasChild,
  BreakpointProvider,
  useMatchedBreakpoints,
  useBreakpoint,
} from "@vue-spectrum/utils";
```

## DOM Ref Utilities

Utilities for DOM/focus ref bridging used by component wrappers:

```ts
import {
  createDOMRef,
  createFocusableRef,
  useDOMRef,
  useFocusableRef,
  unwrapDOMRef,
  useUnwrapDOMRef,
} from "@vue-spectrum/utils";
```

## Style Props

Style conversion primitives from React Spectrum utils are now available for Vue ports:

```ts
import { convertStyleProps, useStyleProps, viewStyleProps } from "@vue-spectrum/utils";
```

## Notes

- Class-name, slot-prop, media/device, breakpoint, DOM-ref, and style-prop conversion primitives are ported; broader `@react-spectrum/utils` surfaces remain in progress.
