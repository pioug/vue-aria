import type { Theme } from "../../provider/src/types";

// Bootstrap Spectrum theme class map adapted from upstream theme-default/light/dark packages.
export const theme: Theme = {
  global: {
    spectrum: "spectrum",
    "spectrum--light": "spectrum--light",
    "spectrum--lightest": "spectrum--lightest",
    "spectrum--dark": "spectrum--dark",
    "spectrum--darkest": "spectrum--darkest",
    "spectrum--medium": "spectrum--medium",
    "spectrum--large": "spectrum--large",
  },
  light: {
    "spectrum--light": "spectrum--light",
  },
  dark: {
    "spectrum--dark": "spectrum--darkest",
  },
  medium: {
    "spectrum--medium": "spectrum--medium",
  },
  large: {
    "spectrum--large": "spectrum--large",
  },
};
