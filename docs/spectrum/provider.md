# @vue-spectrum/provider

Provider-level context baseline for the Vue Spectrum migration.

## Exports

- `provideSpectrumProvider`
- `useSpectrumProvider`
- `useSpectrumProviderContext`
- `useSpectrumProviderProps`
- `useSpectrumProviderDOMProps`
- `useColorScheme`
- `useScale`
- `useMediaQuery`

## Example

```ts
import { provideSpectrumProvider, useSpectrumProviderDOMProps } from "@vue-spectrum/provider";

const theme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};

provideSpectrumProvider({
  theme,
  colorScheme: "dark",
  locale: "en-US",
});

const providerDOMProps = useSpectrumProviderDOMProps();
```

## Notes

- This is the initial migration baseline, not final feature parity with upstream `@react-spectrum/provider`.
- Theme, color scheme, scale, locale/direction, and inherited form-control props are wired for downstream component work.
