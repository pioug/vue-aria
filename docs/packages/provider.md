# @vue-spectrum/provider

`@vue-spectrum/provider` ports upstream `@react-spectrum/provider` application-level context for theme, locale, color scheme, scale, responsive breakpoints, routing integration, and inherited property groups.

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";

const theme = {
  global: {},
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" }
};
</script>

<template>
  <Provider :theme="theme">
    <button type="button">Hello Vue Spectrum!</button>
  </Provider>
</template>
```

## Application provider

A `Provider` must wrap your application root. Child Spectrum components/composables rely on it for theme, locale, breakpoints, and inherited settings.

### Themes

You must pass `theme` on the root provider. Theme objects provide color-scheme and scale class mappings used for wrapper output and downstream visual configuration.

## Implemented modules

- `Provider`
- `useProvider`
- `useProviderProps`
- `useColorScheme` / `useScale` (media-query helpers)

### Color schemes

By default, provider color scheme follows OS preference, with fallback to `defaultColorScheme` and available theme keys. Override with `colorScheme` when app settings require a forced mode.

```vue
<Provider :theme="theme" colorScheme="light">
  <button type="button">Light button</button>
</Provider>
```

### Locales

Locale defaults to browser/system language through `@vue-aria/i18n` and can be overridden using `locale` with a BCP 47 code.

```vue
<Provider :theme="theme" :locale="appLocale">
  <AppContent />
</Provider>
```

Use `useLocale` from `@vue-aria/i18n` to read current locale/direction inside descendants.

### Breakpoints

Provider supplies responsive breakpoints used by `@vue-spectrum/utils` style-props resolution.

Default breakpoints:

- `S`: `640`
- `M`: `768`
- `L`: `1024`
- `XL`: `1280`
- `XXL`: `1536`

Custom breakpoints:

```vue
<Provider :theme="theme" :breakpoints="{ tablet: 640, desktop: 1024 }">
  <ResponsiveView />
</Provider>
```

### Client-side routing

Provider accepts optional `router` (`navigate` and optional `useHref`) so descendant link-like components can use app routing.

```ts
const router = {
  navigate: (path: string) => appRouter.push(path),
  useHref: (href: string) => `/app${href}`
};
```

```vue
<Provider :theme="theme" :router="router">
  <AppContent />
</Provider>
```

## Property groups

Provider can define shared properties for all supported descendants: `isQuiet`, `isEmphasized`, `isDisabled`, `isRequired`, `isReadOnly`, and `validationState`.

Nested providers merge/override from nearest ancestor.

```vue
<Provider :theme="theme" :isQuiet="true">
  <Provider :isDisabled="isFormLocked">
    <FormFields />
  </Provider>
</Provider>
```

Use `useProviderProps` in custom Vue components to merge inherited provider props with local props:

```ts
const merged = useProviderProps({
  isDisabled: props.isDisabled
});
```

## useProvider

`useProvider` returns the nearest provider context (`theme`, `colorScheme`, `scale`, breakpoints, inherited property-group values). This is useful for theme-aware custom components.

```ts
const { colorScheme } = useProvider();
const icon = colorScheme === "dark" ? "moon" : "sun";
```

## Notes

- Upstream provider test parity is in progress for scenarios that depend on downstream Spectrum component packages.
- `Spectrum S2` is out of scope unless explicitly requested.
