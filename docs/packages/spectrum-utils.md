# @vue-spectrum/utils

`@vue-spectrum/utils` ports shared utility modules from upstream `@react-spectrum/utils` for breakpoint context, style-prop resolution, and class-name compatibility.

## Implemented modules

- `BreakpointProvider`
- `useMatchedBreakpoints`
- `useBreakpoint`
- `baseStyleProps`
- `dimensionValue`
- `responsiveDimensionValue`
- `convertStyleProps`
- `useStyleProps`
- `getResponsiveProp`
- `classNames`
- `keepSpectrumClassNames`
- `shouldKeepSpectrumClassNames`

## Breakpoint example

```ts
import { computed } from "vue";
import { BreakpointProvider, useBreakpoint, useMatchedBreakpoints } from "@vue-spectrum/utils";

const breakpoints = { S: 640, M: 768, L: 1024 };
const matchedBreakpoints = useMatchedBreakpoints(breakpoints);
```

```ts
const context = useBreakpoint();
const current = computed(() => context?.value.matchedBreakpoints[0] ?? "base");
```

## styleProps example

```ts
import { useStyleProps } from "@vue-spectrum/utils";

const props = {
  width: { base: "192px", M: "2000px" },
  marginTop: "size-100"
};

const { styleProps } = useStyleProps(props);
```

## classNames compatibility example

```ts
import { classNames, keepSpectrumClassNames } from "@vue-spectrum/utils";

keepSpectrumClassNames();
const cls = classNames({ foo: "_foo" }, "foo");
// "_foo foo"
```

## Notes

- Current slice is focused on provider-responsive behavior and compatibility support needed by `@vue-spectrum/provider`.
- Remaining upstream utility modules are ported incrementally as downstream packages require them.
- `Spectrum S2` is out of scope unless explicitly requested.
