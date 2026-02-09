# @vue-spectrum/provider

Provider-level context baseline for the Vue Spectrum migration.

<script setup lang="ts">
import { Provider, useProvider } from "@vue-spectrum/vue-spectrum";
import { computed, defineComponent, h } from "vue";

const previewTheme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};

const ColorSchemeBadge = defineComponent({
  name: "ColorSchemeBadge",
  setup() {
    const colorScheme = computed(() => useProvider().value.colorScheme);
    return () =>
      h("span", { class: "spectrum-preview-chip", "data-testid": "provider-preview-scheme" }, colorScheme.value);
  },
});
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
    <ColorSchemeBadge />
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
