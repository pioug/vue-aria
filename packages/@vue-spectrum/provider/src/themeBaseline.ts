import type { SpectrumTheme } from "./types";

export const SPECTRUM_COLOR_SCHEMES = ["light", "dark"] as const;
export const SPECTRUM_SCALES = ["medium", "large"] as const;

export type SpectrumColorSchemeName = (typeof SPECTRUM_COLOR_SCHEMES)[number];
export type SpectrumScaleName = (typeof SPECTRUM_SCALES)[number];

export const DEFAULT_SPECTRUM_THEME_CLASS_MAP: Readonly<SpectrumTheme> = Object.freeze({
  global: Object.freeze({
    spectrum: "spectrum",
  }),
  light: Object.freeze({
    "spectrum--light": "spectrum--light",
  }),
  dark: Object.freeze({
    "spectrum--dark": "spectrum--dark",
  }),
  medium: Object.freeze({
    "spectrum--medium": "spectrum--medium",
  }),
  large: Object.freeze({
    "spectrum--large": "spectrum--large",
  }),
});
