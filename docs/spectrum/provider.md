# @vue-spectrum/provider

Provider-level context baseline for the Vue Spectrum migration.

<script setup lang="ts">
import { Provider } from "@vue-spectrum/vue-spectrum";

const previewTheme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};
</script>

## Preview

<div class="spectrum-preview">
  <Provider
    :theme="previewTheme"
    color-scheme="dark"
    scale="medium"
    locale="en-US"
    v-bind="{ UNSAFE_className: 'spectrum-preview-stack' }"
  >
    <p class="spectrum-preview-muted">Nested components consume provider context automatically:</p>
    <span class="spectrum-preview-chip" data-testid="provider-preview-scheme">dark</span>
  </Provider>
</div>

## Exports

- `Provider`
- `provideSpectrumProvider`
- `useProvider`
- `useProviderContext`
- `useProviderProps`
- `useProviderDOMProps`
- `useSpectrumProvider`
- `useSpectrumProviderContext`
- `useSpectrumProviderProps`
- `useSpectrumProviderDOMProps`
- `useColorScheme`
- `useScale`
- `useMediaQuery`
- `SPECTRUM_COLOR_SCHEMES`
- `SPECTRUM_SCALES`
- `DEFAULT_SPECTRUM_THEME_CLASS_MAP`

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";

const theme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};
</script>

<template>
  <Provider :theme="theme" color-scheme="dark" scale="medium" locale="en-US">
    <slot />
  </Provider>
</template>
```

## Notes

- This is the initial migration baseline, not final feature parity with upstream `@react-spectrum/provider`.
- Theme, color scheme, scale, locale/direction, and inherited form-control props are wired for downstream component work.
