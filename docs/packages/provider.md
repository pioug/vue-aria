# @vue-spectrum/provider

`@vue-spectrum/provider` ports upstream `@react-spectrum/provider` application-level context for theme, color scheme, scale, and inherited component settings.

## Current slice

- Package scaffolding created.
- `useColorScheme` and `useScale` media-query hooks ported.
- Initial Vue `Provider` / `useProvider` / `useProviderProps` API surface wired.

## Implemented modules

- `Provider`
- `useProvider`
- `useProviderProps`
- `useColorScheme` / `useScale` (internal media-query helpers)

## Notes

- This is the initial bootstrap slice; styling wrappers and advanced Spectrum provider behavior are still in progress.
- `Spectrum S2` is out of scope unless explicitly requested.
