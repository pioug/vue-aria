import {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  type SpectrumTheme,
} from "@vue-spectrum/provider";

export const theme: SpectrumTheme = {
  global: {
    ...(DEFAULT_SPECTRUM_THEME_CLASS_MAP.global ?? {}),
  },
  light: {
    ...(DEFAULT_SPECTRUM_THEME_CLASS_MAP.light ?? {}),
  },
  dark: {
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
