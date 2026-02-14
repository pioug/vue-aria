import { theme as defaultTheme } from "../../theme/src";
import type { Theme } from "../../provider/src/types";

export const theme: Theme = {
  ...defaultTheme,
  global: {
    ...defaultTheme.global,
    express: "spectrum--express",
  },
  medium: {
    ...defaultTheme.medium,
    express: "spectrum--express-medium",
  },
  large: {
    ...defaultTheme.large,
    express: "spectrum--express-large",
  },
};
