import type { SpectrumTheme } from "@vue-spectrum/provider";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP } from "@vue-spectrum/provider";

export const theme: SpectrumTheme = {
  global: {
    ...(DEFAULT_SPECTRUM_THEME_CLASS_MAP.global ?? {}),
  },
  light: {
    "spectrum--dark": "spectrum--dark",
  },
  dark: {
    "spectrum--darkest": "spectrum--darkest",
    ...(DEFAULT_SPECTRUM_THEME_CLASS_MAP.dark ?? {}),
  },
  medium: {
    ...(DEFAULT_SPECTRUM_THEME_CLASS_MAP.medium ?? {}),
  },
  large: {
    ...(DEFAULT_SPECTRUM_THEME_CLASS_MAP.large ?? {}),
  },
};

export type { SpectrumTheme } from "@vue-spectrum/provider";
