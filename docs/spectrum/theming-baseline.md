# Spectrum Theming Baseline

This page defines the Phase 1 theming baseline used by the Vue Spectrum migration.

## Supported Global Axes

- Color schemes: `light`, `dark`
- Scales: `medium`, `large`

## Baseline Theme Contract

Provider-level themes should expose these sections:

- `global`
- `light`
- `dark`
- `medium`
- `large`

Each section is a class-map object where keys and values are class names.

## Default Baseline Exports

`@vue-spectrum/provider` exports:

- `SPECTRUM_COLOR_SCHEMES`
- `SPECTRUM_SCALES`
- `DEFAULT_SPECTRUM_THEME_CLASS_MAP`

## Example

```ts
import {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  provideSpectrumProvider,
} from "@vue-spectrum/vue-spectrum";

provideSpectrumProvider({
  theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  colorScheme: "light",
  scale: "medium",
});
```

## Notes

- This is a migration baseline, not the full final Spectrum token system.
- Docs manual-testing baseline styles are currently centralized in `docs/.vitepress/theme/spectrum-base.css` to provide cross-component visual structure while runtime package parity progresses.
- Theme package parity remains in the Phase 1 package track. `theme-default`, `theme-light`, `theme-dark`, and `theme-express` baselines are now in progress.
