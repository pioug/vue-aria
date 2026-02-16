import { theme as defaultTheme } from "../../theme-default/src";
import type { Theme } from "../../provider/src/types";

export const theme: Theme = {
  ...defaultTheme,
  light: {
    "spectrum--light": "spectrum--dark",
  },
  dark: {
    "spectrum--dark": "spectrum--darkest",
  },
};
