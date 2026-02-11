import type { SpectrumTheme } from "@vue-spectrum/provider";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";

export const theme: SpectrumTheme = {
  ...defaultTheme,
  global: {
    ...(defaultTheme.global ?? {}),
    express: "spectrum--express",
  },
  medium: {
    ...(defaultTheme.medium ?? {}),
    express: "spectrum--express-medium",
  },
  large: {
    ...(defaultTheme.large ?? {}),
    express: "spectrum--express-large",
  },
};

export type { SpectrumTheme } from "@vue-spectrum/provider";
